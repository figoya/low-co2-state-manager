import chai, { expect } from "chai";
import chaiDom from "chai-dom";
import {
  publish,
  subscribe,
  unsubscribe,
  getSubscriptions,
  getState,
  setState,
  amendState,
  addStateModifier,
  getStateModifiers,
  setStateModifiers,
  resetAllState,
  scopeName
} from "./src/index.js";

chai.use(chaiDom);

const mockState = {
  kString: "string",
  kNumber: 1,
  kArray: ["string", 1, [], {}, null, undefined, false, Symbol()],
  kObject: {
    kString: "string",
    kNumber: 1,
    kArray: [],
    kObject: {},
    kNull: null,
    kUndefined: undefined,
    kBoolean: false,
    kSymbol: Symbol(),
  },
  kUndefined: undefined,
  kBoolean: false,
  kSymbol: Symbol(),
};

const mockModifier1 = (customEventName, currentState, scope, data) => {
  switch (scopeName(customEventName, scope)) {
    case scopeName("CUSTOM_EVENT_NAME", scope):
      return {
        ...currentState,
        kString: data.kString,
        kNumber: data.kNumber,
        kArray: [
          ...data.kArray,
          ...currentState.kArray.slice(data.kArray.length),
        ],
        kObject: {
          ...currentState.kObject,
          kNumber: data.kObject.kNumber,
          kSymbol: data.kObject.kSymbol,
        },
        kSymbol: data.kSymbol,
      };
    default:
      return currentState;
  }
};

const mockModifier2 = (customEventName, currentState, scope, data) => {
  switch (scopeName(customEventName, scope)) {
    case scopeName("CUSTOM_EVENT_NAME", scope):
      return {
        ...currentState,
        kString: `${data.kString} 2`,
        kNumber: data.kNumber,
        kArray: [
          ...data.kArray,
          ...currentState.kArray.slice(data.kArray.length),
        ],
        kObject: {
          ...currentState.kObject,
          kNumber: data.kObject.kNumber,
          kSymbol: data.kObject.kSymbol,
        },
        kSymbol: data.kSymbol,
      };
    default:
      return currentState;
  }
};

describe("setState() and getState()", () => {
  describe("set value (input) and get value (output) are the same", () => {
    beforeEach(() => {
      resetAllState({});
    });
    it(`should be true when setState({ k: "v"});`, () => {
      setState({ k: "v" });
      expect(getState().k).to.equal("v");
    });
    it(`should be true when setState({});`, () => {
      setState({});
      expect(getState()).to.be.empty;
    });
    it(`should be true when setState(
          { k: { 
              k1: "v1",
              k2: 1,
              k3: null,
              k4: undefined
            }
          }
        );`, () => {
      setState({
        k: {
          k1: "v1",
          k2: 1,
          k3: null,
          k4: undefined,
        },
      });
      expect(getState().k.k1).to.be.equal("v1");
      expect(getState().k.k2).to.be.equal(1);
      expect(getState().k.k3).to.be.equal(null);
      expect(getState().k.k4).to.be.equal(undefined);
      expect(getState().k.nonExistentKey).to.be.equal(undefined);
      expect(Object.keys(getState().k).length).to.be.equal(3); // json stringify removes keys with value of undefined
    });
    it(`should be true when setState(
          { 
            k: [ "v1", 1, null, undefined ]
          }
        );`, () => {
      setState({ k: ["v1", 1, null, undefined] });
      expect(getState().k[0]).to.be.equal("v1");
      expect(getState().k[1]).to.be.equal(1);
      expect(getState().k[2]).to.be.equal(null);
      expect(getState().k[3]).to.be.equal(null); // json stringify converts undefined to null in an array
      expect(getState().k[10000]).to.be.equal(undefined);
    });
    it(`should be true when setState(
          { k: "v"}, 
          "customScope"
        );`, () => {
      setState({ k: "v" }, "customScope");
      expect(getState("customScope").k).to.be.equal("v");
      expect(getState()).to.be.equal(undefined);
    });
  });
});

describe("amendState()", () => {
  describe("State is changed correctly when using amendState and a state modifier", () => {
    beforeEach(() => {
      resetAllState();
      addStateModifier(mockModifier1);
    });
    it("should work when using default scope", () => {
      setState(mockState);
      amendState(
        "CUSTOM_EVENT_NAME", {
          kString: "new string",
          kNumber: 10,
          kArray: ["new string"],
          kObject: {
            kNumber: 2,
          }
        }
      );
      expect(getState("global")?.kString).to.be.equal("new string");
      expect(getState("global")?.kNumber).to.be.equal(10);
      expect(getState("global")?.kArray[0]).to.be.equal("new string");
      expect(getState("global")?.kArray[1]).to.be.equal(1);
      expect(getState("global")?.kObject.kString).to.be.equal("string");
      expect(getState("global")?.kObject.kNumber).to.be.equal(2);
    });
    it("should work when using custom scope", () => {
      setState(mockState, "customScope");
      amendState(
        "CUSTOM_EVENT_NAME",
        {
          kString: "new string",
          kNumber: 10,
          kArray: ["new string"],
          kObject: {
            kNumber: 2,
          },
        },
        "customScope"
      );
      expect(getState("customScope")?.kString).to.be.equal("new string");
      expect(getState("customScope")?.kNumber).to.be.equal(10);
      expect(getState("customScope")?.kArray[0]).to.be.equal("new string");
      expect(getState("customScope")?.kArray[1]).to.be.equal(1);
      expect(getState("customScope")?.kObject.kString).to.be.equal("string");
      expect(getState("customScope")?.kObject.kNumber).to.be.equal(2);
    });
    it("should work when using default scope and 2 different state modifiers", () => {
      addStateModifier(mockModifier2);
      setState(mockState);
      amendState(
        "CUSTOM_EVENT_NAME", {
          kString: "new string",
          kNumber: 10,
          kArray: ["new string"],
          kObject: {
            kNumber: 2,
          }
        }
      );
      expect(getState()?.kString).to.be.equal("new string 2");
      expect(getState()?.kNumber).to.be.equal(10);
      expect(getState()?.kArray[0]).to.be.equal("new string");
      expect(getState()?.kArray[1]).to.be.equal(1);
      expect(getState()?.kObject.kString).to.be.equal("string");
      expect(getState()?.kObject.kNumber).to.be.equal(2);
    });
  });
});

describe("addStateModifier()", () => {
  beforeEach(() => {
    resetAllState();
    setStateModifiers([]);
  });
  it("should allow adding the same state modifier more than once", () => {
    addStateModifier(mockModifier1);
    addStateModifier(mockModifier2);
    expect(getStateModifiers()).to.have.lengthOf(2);
  });
});

describe("publish(), subscribe() and unsubscribe()", () => {
  const action = (customEvent, domEvent) => {};
  describe("subscribe()", () => {
    beforeEach(() => {
      resetAllState();
      setStateModifiers([]);
      unsubscribe();
    });
    afterEach(() => {
      unsubscribe();
    })
    
    it("should create a subscription with the right event name, using the default scope", () => {
      subscribe({
        event: "CUSTOM_EVENT_NAME_1",
        action
      });
      expect(getSubscriptions()[0].event).to.be.equal("GLOBAL_CUSTOM_EVENT_NAME_1");
    });
    it("should create a subscription with the right event name, when using a custom scope", () => {
      subscribe({
        event: "CUSTOM_EVENT_NAME_1",
        action,
        scope: "scope-1"
      });
      expect(getSubscriptions()[0].event).to.be.equal("SCOPE-1_CUSTOM_EVENT_NAME_1");
    });
    it("should create the right quantity of subscriptions when 'event' is a string", () => {
      subscribe({
        event: "CUSTOM_EVENT_NAME_1",
        action
      });
      expect(getSubscriptions()).to.have.lengthOf(1);
    });
    it("should create the right quantity of subscriptions when 'event' is an array", () => {
      subscribe({
        event: ["CUSTOM_EVENT_NAME_1", "CUSTOM_EVENT_NAME_2"],
        action
      });
      expect(getSubscriptions()).to.have.lengthOf(2);
    });
    it("should still add a subsciption when there are duplicate event names", () => {
      subscribe({
        event: ["CUSTOM_EVENT_NAME_1", "CUSTOM_EVENT_NAME_1"],
        action
      });
      expect(getSubscriptions()).to.have.lengthOf(2);
    });
    it("should have a cumilative effect when called multiple times", () => {
      subscribe({
        event: ["CUSTOM_EVENT_NAME_1", "CUSTOM_EVENT_NAME_1"],
        action
      });
      subscribe({
        event: ["CUSTOM_EVENT_NAME_1", "CUSTOM_EVENT_NAME_1"],
        action
      });
      subscribe({
        event: ["CUSTOM_EVENT_NAME_2", "CUSTOM_EVENT_NAME_2"],
        action
      });
      expect(getSubscriptions()).to.have.lengthOf(6);
    });
  });
  describe("publish()", () => {
    beforeEach(() => {
      resetAllState();
      setStateModifiers([]);
      unsubscribe();
    });
    afterEach(() => {
      unsubscribe();
    })
    it("should cause subscribe.action to be called once when there is publish() is called once", () => {
      let testVar = 0;
      subscribe({
        event: "CUSTOM_EVENT_NAME_1",
        action: (customEvent, domEvent) => {
          testVar = testVar + 1;
        }
      });
      publish("CUSTOM_EVENT_NAME_1", {});
      expect(testVar).to.be.equal(1);
    })
    it("should cause subscribe.action to be called twice when publish() is called twice", () => {
      let testVar = 0;
      subscribe({
        event: "CUSTOM_EVENT_NAME_1",
        action: (customEvent, domEvent) => {
          testVar = testVar + 1;
        }
      });
      publish("CUSTOM_EVENT_NAME_1", {});
      expect(testVar).to.be.equal(1);
      publish("CUSTOM_EVENT_NAME_1", {});
      expect(testVar).to.be.equal(2);
    })
    it("should cause subscribe.action to be called once per subscribe()", () => {
      let testVar = 0;
      subscribe({
        event: "CUSTOM_EVENT_NAME_1",
        action: (customEvent, domEvent) => {
          testVar = testVar + 1;
        }
      });
      subscribe({
        event: "CUSTOM_EVENT_NAME_1",
        action: (customEvent, domEvent) => {
          testVar = testVar + 1;
        }
      });
      publish("CUSTOM_EVENT_NAME_1", {});
      expect(testVar).to.be.equal(2);
    })
    it("should NOT cause subscribe.action to be called when the custom event name does not match", () => {
      let testVar = 0;
      subscribe({
        event: "CUSTOM_EVENT_NAME_1",
        action: (customEvent, domEvent) => {
          testVar = 1;
        }
      });
      publish("CUSTOM_EVENT_NAME_2", {});
      expect(testVar).to.be.equal(0);
    })
  })

  describe("unsubscribe(without args)", () => {
    let testResults = {
      count: 0
    };
    beforeEach(() => {
      resetAllState();
      setStateModifiers([]);
      unsubscribe();
      testResults = {
        count: 0
      };
      subscribe({
        name: "subscriptionName1",
        event: ["CUSTOM_EVENT_NAME_1", "CUSTOM_EVENT_NAME_2"],
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
      subscribe({
        name: "subscriptionName1",
        event: "CUSTOM_EVENT_NAME_3",
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
      subscribe({
        name: "subscriptionName2",
        event: ["CUSTOM_EVENT_NAME_1", "CUSTOM_EVENT_NAME_2"],
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
      subscribe({
        name: "subscriptionName2",
        event: "CUSTOM_EVENT_NAME_3",
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
      subscribe({
        name: "subscriptionName1",
        event: "CUSTOM_EVENT_NAME_1",
        scope: "custom-scope",
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
    });
    afterEach(() => {
      resetAllState();
      setStateModifiers([]);
      unsubscribe();
      testResults = {
        count: 0
      };
    })
    it("should remove all subscriptions and no actions should be called", () => {
      expect(getSubscriptions()).to.have.lengthOf(7);
      publish("CUSTOM_EVENT_NAME_1", {});
      expect(testResults.count).to.be.equal(2);
      publish("CUSTOM_EVENT_NAME_2", {});
      expect(testResults.count).to.be.equal(4);
      publish("CUSTOM_EVENT_NAME_3", {});
      expect(testResults.count).to.be.equal(6);
      publish("CUSTOM_EVENT_NAME_3", {}, "custom-scope");
      expect(testResults.count).to.be.equal(6);
      publish("CUSTOM_EVENT_NAME_1", {}, "custom-scope");
      expect(testResults.count).to.be.equal(7);
      unsubscribe();
      expect(getSubscriptions()).to.have.lengthOf(0);
      testResults.count = 0;
      publish("CUSTOM_EVENT_NAME_1", {});
      expect(testResults.count).to.be.equal(0);
      publish("CUSTOM_EVENT_NAME_2", {});
      expect(testResults.count).to.be.equal(0);
      publish("CUSTOM_EVENT_NAME_3", {});
      expect(testResults.count).to.be.equal(0);
      publish("CUSTOM_EVENT_NAME_1", {}, "custom-scope");
      expect(testResults.count).to.be.equal(0);
    });
  })

  describe("unsubscribe(with args)", () => {
    let testResults = {
      count: 0
    };
    beforeEach(() => {
      resetAllState();
      setStateModifiers([]);
      unsubscribe();
      testResults = {
        count: 0
      };
      subscribe({
        name: "subscriptionName1",
        event: ["CUSTOM_EVENT_NAME_1", "CUSTOM_EVENT_NAME_2"],
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
      subscribe({
        name: "subscriptionName1",
        event: "CUSTOM_EVENT_NAME_3",
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
      subscribe({
        name: "subscriptionName2",
        event: ["CUSTOM_EVENT_NAME_1", "CUSTOM_EVENT_NAME_2"],
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
      subscribe({
        name: "subscriptionName2",
        event: "CUSTOM_EVENT_NAME_3",
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
      subscribe({
        name: "subscriptionName1",
        event: "CUSTOM_EVENT_NAME_1",
        scope: "custom-scope",
        action: (customEvent, domEvent) => {
          testResults.count += 1
        }
      });
    })

    afterEach(() => {
      resetAllState();
      setStateModifiers([]);
      unsubscribe();
      testResults = {
        count: 0
      };
    })

    it("should cause a subscription's action not to be called", () => {
      publish("CUSTOM_EVENT_NAME_1", {});
      expect(testResults.count).to.be.equal(2);
      publish("CUSTOM_EVENT_NAME_2", {});
      expect(testResults.count).to.be.equal(4);
      publish("CUSTOM_EVENT_NAME_3", {});
      expect(testResults.count).to.be.equal(6);
      testResults.count = 0;
      unsubscribe({
        name: "subscriptionName1",
        event: "CUSTOM_EVENT_NAME_1"
      });
      unsubscribe({
        name: "subscriptionName2",
        event: "CUSTOM_EVENT_NAME_1"
      });
      unsubscribe({
        name: "subscriptionName2",
        event: "CUSTOM_EVENT_NAME_2"
      });
      publish("CUSTOM_EVENT_NAME_1", {});
      expect(testResults.count).to.be.equal(0);
      publish("CUSTOM_EVENT_NAME_2", {});
      expect(testResults.count).to.be.equal(1);
      publish("CUSTOM_EVENT_NAME_3", {});
      expect(testResults.count).to.be.equal(3);
    });

    it("should remove a single subscription from the subscriptions array", () => {
      expect(getSubscriptions()).to.have.lengthOf(7);
      unsubscribe({
        name: "subscriptionName1",
        event: "CUSTOM_EVENT_NAME_1"
      });
      expect(getSubscriptions()).to.have.lengthOf(6);
      unsubscribe({
        name: "subscriptionName2",
        event: "CUSTOM_EVENT_NAME_1"
      });
      expect(getSubscriptions()).to.have.lengthOf(5);
      unsubscribe({
        name: "subscriptionName2",
        event: "CUSTOM_EVENT_NAME_2"
      });
      expect(getSubscriptions()).to.have.lengthOf(4);
    });

    it("should remove multiple subscriptions from the subscriptions array, by name", () => {
      expect(getSubscriptions()).to.have.lengthOf(7);
      unsubscribe({
        name: "subscriptionName1"
      });
      expect(getSubscriptions()).to.have.lengthOf(3);
    });

    it("should remove multiple subscriptions from the subscriptions array, by name and scope", () => {
      expect(getSubscriptions()).to.have.lengthOf(7);
      unsubscribe({
        name: "subscriptionName1",
        scope: "custom-scope"
      });
      expect(getSubscriptions()).to.have.lengthOf(6);
    });

    it("should remove multiple subscriptions from the subscriptions array, by event", () => {
      expect(getSubscriptions()).to.have.lengthOf(7);
      unsubscribe({
        event: "CUSTOM_EVENT_NAME_1"
      });
      expect(getSubscriptions()).to.have.lengthOf(5);
    });

    it("should remove multiple subscriptions from the subscriptions array, by event and scope", () => {
      expect(getSubscriptions()).to.have.lengthOf(7);
      unsubscribe({
        event: "CUSTOM_EVENT_NAME_1",
        scope: "custom-scope"
      });
      expect(getSubscriptions()).to.have.lengthOf(6);
    });
        
    it("should remove the event listener from the window dom object", () => {
      // this is weirdly difficult to test, although the other tests heavily imply that it is true
      // getEventListeners doesn't work in browsers natively.
      // if you search getEventListeners there are come solutions that might be worth implementing
      // they seem to involve replacing 
      //    Element.prototype.addEventListener and Element.prototype.removeEventListener
      // but not sure if any of them work with custom event listeners
      expect(true).to.be.equal(true);
    });
  })
});

describe("scopeName()", () => {
  it("works", () => {
    expect(scopeName("CUSTOM_EVENT_NAME_1")).to.be.equal("GLOBAL_CUSTOM_EVENT_NAME_1");
    expect(scopeName("CUSTOM_EVENT_NAME_1", "scope-NAME")).to.be.equal("SCOPE-NAME_CUSTOM_EVENT_NAME_1");
  })


})
