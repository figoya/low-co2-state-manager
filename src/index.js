let subscriptions = [];
let stateModifiers = [];

const handler = createHandler(
  "DOM_CONTENT_LOADED",
  function action(customEvent, domEvent) {
    console.info(customEvent, domEvent);
  }
);
window.addEventListener("GLOBAL_DOM_CONTENT_LOADED", handler);

addEventListener("DOMContentLoaded", (event) => {
  publish("DOM_CONTENT_LOADED", event);
});

function subscribe(subscription) {
  try {
    if (type(subscription.event) === "string") {
      const handler = createHandler(
        subscription.event,
        subscription.action,
        subscription.scope
      );
      window.addEventListener(subscription.event, handler);
      addSubscription({
        group: subscription.group || null,
        event: subscription.event,
        scope: subscription.scope || "global",
        handler,
      });
    } else if (type(subscription.event) === "array") {
      subscription.event.forEach((customEventName) => {
        const handler = createHandler(
          customEventName,
          subscription.action,
          subscription.scope
        );
        window.addEventListener(customEventName, handler);
        addSubscription({
          group: subscription.group || null,
          event: customEventName,
          scope: subscription.scope || "global",
          handler,
        });
      });
    } else {
      throw "subscription.event must be a string or an array";
    }
  } catch (error) {
    console.error(error);
  }
}

function unsubscribe(unsubscription) {   
  const subs = [...getSubscriptions()];
  const subsToKeep = subs.filter((sub) => {
    if(unsubscription) {
      if(unsubscription.event && sub.event !== unsubscription.event){
        return true;
      }
      if(unsubscription.scope && sub.scope !== unsubscription.scope){
        return true;
      }
      if(unsubscription.group && sub.group !== unsubscription.group){
        return true;
      }
    }
    window.removeEventListener(sub.event, sub.handler);
    return false;
  });
  setSubscriptions(subsToKeep);
}

function getSubscriptions() {
  try {
    if (type(subscriptions) === "array") {
      return [...subscriptions];
    } else {
      throw `subscriptions is type ${type(
        subscriptions
      )}. failed to get subscriptions as it must be an array.`;
    }
  } catch (error) {
    console.error(error);
  }
}
function setSubscriptions(value) {
  try {
    if (type(value) === "array") {
      subscriptions = value;
    } else {
      throw `subscriptions is type ${type(
        subscriptions
      )}. failed to set subscriptions as it must be an array.`;
    }
  } catch (error) {
    console.error(error);
  }
}

function addSubscription(newSub) {
  const newSubs = [...getSubscriptions()];
  newSubs.push(newSub);
  setSubscriptions(newSubs);
}

function createHandler(customEventName, action, scope = "global") {
  return (event) => {
    if(event.detail.scope === scope){
      amendState(customEventName, event.detail?.data || null, scope);
      action(event, event.detail.domEvent);
    }
  };
}

function publish(customEventName, domEvent, scope = "global", data = null) {
  dispatchEvent(
    new CustomEvent(customEventName, {
      detail: { domEvent, scope, data },
    })
  );
}

function getState(scope = "global") {
  try {
    if (!window.sessionStorage.getItem("lcsm")) {
      window.sessionStorage.setItem("lcsm", JSON.stringify({ [scope]: {} }));
    }
    const state = JSON.parse(window.sessionStorage.getItem("lcsm"));
    return state[scope];
  } catch (error) {
    console.error(`
      window.sessionStorage.state must be valid JSON.
      ${error}
    `);
  }
}

function getAllState() {
  try {
    if (!window.sessionStorage.getItem("lcsm")) {
      window.sessionStorage.setItem("lcsm", JSON.stringify({}));
    }
    return JSON.parse(window.sessionStorage.getItem("lcsm"));
  } catch (error) {
    console.error(`
      window.sessionStorage.state must be valid JSON.
      ${error}
    `);
  }
}

function setState(value, scope = "global") {
  const newState = {
    ...getAllState(),
    [scope]: value,
  };
  window.sessionStorage.setItem("lcsm", JSON.stringify(newState));
}

function resetAllState() {
  window.sessionStorage.setItem("lcsm", JSON.stringify({}));
}

function amendState(customEventName, data = null, scope = "global") {
  const currentState = getState(scope);
  let newState = currentState;
  getStateModifiers().forEach((modifier) => {
    if (scope === modifier.scope) {
      newState = modifier.xxx(customEventName, newState, scope, data);
    }
  });
  setState(newState, scope);
}

function getStateModifiers() {
  return stateModifiers;
}

function setStateModifiers(value) {
  stateModifiers = value;
}

function addStateModifier(newModifier, scope = "global") {
  let modifiers = [...getStateModifiers()];
  modifiers.push({
    xxx: newModifier,
    scope,
  });
  setStateModifiers(modifiers);
}


function type(value) {
  var regex = /^\[object\s(\S+?)\]$/;
  var matches = Object.prototype.toString.call(value).match(regex) || [];
  return (matches[1] || "undefined").toLowerCase();
}

export {
  publish,
  subscribe,
  unsubscribe,
  getSubscriptions,
  setSubscriptions,
  getState,
  setState,
  amendState,
  addStateModifier,
  getStateModifiers,
  setStateModifiers,
  resetAllState,
};
