let subscriptions = [];
let stateModifiers = [];

const handler = createHandler(
  "DOM_CONTENT_LOADED",
  function action(customEvent, domEvent) {}
);
window.addEventListener("DOM_CONTENT_LOADED", handler);

addEventListener("DOMContentLoaded", (event) => {
  publish("DOM_CONTENT_LOADED", event);
});

function subscribe(subscription) {
  try {
    if (type(subscription.event) === "string") {
      const scopedCustomEventName = scopeName(
        subscription.event,
        subscription.scope
      );
      const handler = createHandler(scopedCustomEventName, subscription.action);
      window.addEventListener(scopedCustomEventName, handler);
      addSubscription({
        name: subscription.name || null,
        event: scopedCustomEventName,
        scope: subscription.scope || null,
        handler,
      });
    } else if (type(subscription.event) === "array") {
      subscription.event.forEach((customEventName) => {
        const scopedCustomEventName = scopeName(
          customEventName,
          subscription.scope
        );
        const handler = createHandler(
          scopedCustomEventName,
          subscription.action
        );
        window.addEventListener(scopedCustomEventName, handler);
        addSubscription({
          name: subscription.name || null,
          event: scopedCustomEventName,
          scope: subscription.scope || null,
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

function unsubscribe(unsubscription = {}) {
  const subs = getSubscriptions();
  const subsToKeep = [];
  if (unsubscription.event) {
    unsubscription.scopedEvent = scopeName(unsubscription.event, unsubscription.scope);
  }
  subs.forEach((sub) => {
    let remove = false;
    if (!unsubscription || (!unsubscription.event && !unsubscription.name)) {
      remove = true;
    } else if (unsubscription.event && !unsubscription.name) {
      remove = sub.event === unsubscription.scopedEvent;
    } else if (!unsubscription.event && unsubscription.name && !unsubscription.scope) {
      remove = sub.name === unsubscription.name;
    } else if (!unsubscription.event && unsubscription.name && unsubscription.scope) {
      remove = sub.name === unsubscription.name && sub.scope === unsubscription.scope;
    } else {
      remove =
        sub.event === unsubscription.scopedEvent && sub.name === unsubscription.name;
    }
    if (remove) {
      window.removeEventListener(sub.event, sub.handler);
    } else {
      subsToKeep.push(sub);
    }
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

function createHandler(name, action, scope = "global") {
  return (event) => {
    amendState(name, event.detail?.data || null, scope);
    action(event, event.detail.domEvent);
  };
}

function publish(customEventName, domEvent, scope = "global", data = null) {
  dispatchEvent(
    new CustomEvent(scopeName(customEventName, scope), {
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

function setState(value, scope = "global") {
  const newState = {
    ...getState(),
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
    newState = modifier(customEventName, newState, scope, data);
  });
  setState(newState, scope);
}

function getStateModifiers() {
  return stateModifiers;
}

function setStateModifiers(value) {
  stateModifiers = value;
}

function addStateModifier(newModifier) {
  let modifiers = [...getStateModifiers()];
  modifiers.push(newModifier);
  setStateModifiers(modifiers);
}

function scopeName(customEventName, scope = "global") {
  try {
    if (type(scope) === "string") {
      return scope.toUpperCase() + "_" + customEventName;
    } else {
      throw "Scope must be a string";
    }
  } catch (error) {
    console.error(error);
  }
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
  scopeName
};
