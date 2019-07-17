'use strict';

//TODO: KWESTIA SUBSCRIPTION NOTYFIKACJE POWINNY BYC W PLIKU HTML

let applicationServerPublicKey = 'BJHNavID1buTSCGMNw76FczPiVzXC_HTt2ibyt20PsiDRTyspk5IdVSu-I8PILXvhJTxw4W-Pb7QVmoz3CU682c';

const pushButton = document.querySelector('.js-push-btn');
const copyCodeButton = document.querySelector('.js-copy-subs-code');


const subscribeElem = document.querySelector('.subscription-info');

let isSubscribed = false;
let swRegistration = null;


function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function initializeUI() {
	pushButton.addEventListener('click', function() {
		pushButton.disabled = true;
    applicationServerPublicKey=document.querySelector('.noti-public-key-text').value;
    console.log(applicationServerPublicKey)
		if (isSubscribed) {
		  unsubscribeUser();
		} else {
		  subscribeUser();
		}
	  });
  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

	updateSubscriptionOnServer(subscription);
	
    if (isSubscribed) {
      console.log('User IS subscribed.');
      subscribeElem.textContent="Subscribe status: User IS subscribed."
    } else {
      console.log('User is NOT subscribed.');
      subscribeElem.textContent="Subscribe status: User is NOT subscribed."
    }

    updateBtn();
  });
  
  copyCodeButton.addEventListener('click', function() {
		/* Get the text field */
    debugger
    var copyText = document.querySelector('.js-subscription-json');

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */
    alert("Copied the text: " + copyText.value);
	  });
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');
    subscribeElem.textContent="Subscribe status: User is subscribed."

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    subscribeElem.textContent="Subscribe status: User is unsubscribed."
    isSubscribed = false;

    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.value = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}

function updateBtn() {
if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }
  
  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

// Sprawdź czy SW jest obsługiwany
  if (navigator.serviceWorker && 'PushManager' in window) {
      // Sprawdz czy na stronie są juz zarejestrowane jakies SW
    navigator.serviceWorker.getRegistrations().then(function(swReg) {
      console.log('Service Worker is registered', swReg);

      swRegistration = swReg[0];
      initializeUI()
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}

