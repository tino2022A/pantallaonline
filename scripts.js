"use strict";

// Write OpenTok SDK version
let element = document.getElementById("OTversion");
element.insertAdjacentHTML("beforeend", OT.version + "</p>");

let apiKey;
let sessionId;
let token;
var session;
var publishOptions = {
  videoSource: "screen",
  maxResolution: { width: 1920, height: 1080 },
  insertMode: "append",
  width: "100%",
  height: "100%",
  showControls: true,
  style: {
    audioLevelDisplayMode: "on",
    archiveStatusDisplayMode: "off"
  }
};
// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    console.log(error.message);
  }
}

function initializeSession() {
  session = OT.initSession(apiKey, sessionId);
  session.on("streamCreated", function (event) {
    session.subscribe(
      event.stream,
      "subscriber",
      {
        insertMode: "append",
        width: "100%",
        height: "100%"
      },
      handleError
    );
  });

  OT.checkScreenSharingCapability(function (response) {
    if (!response.supported || response.extensionRegistered === false) {
      // This browser does not support screen sharing.
      alert("This browser does not support screen sharing");
    } else if (response.extensionInstalled === false) {
      // Prompt to install the extension.
    } else {
      // Screen sharing is available. Publish the screen.
      var publisher = OT.initPublisher(
        "publisher",
        publishOptions,
        function (error) {
          if (error) {
            // Look at error.message to see what went wrong.
          } else {
            session.connect(token, function (error) {
              if (error) {
                handleError(error);
              } else {
                session.publish(publisher, handleError);
              }
            });
          }
        }
      );
    }
  });
}

// See the config.js file.
if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  initializeSession();
} else if (SAMPLE_SERVER_BASE_URL) {
  // Make a GET request to get the OpenTok API key, session ID, and token from the server
  fetch(SAMPLE_SERVER_BASE_URL + "/session")
    .then((response) => response.json())
    .then((json) => {
      apiKey = json.apiKey;
      sessionId = json.sessionId;
      token = json.token;
      // Initialize an OpenTok Session object
      initializeSession();
    })
    .catch((error) => {
      handleError(error);
      alert(
        "Failed to get OpenTok sessionId and token. Make sure you have updated the config.js file."
      );
    });
} else {
  alert(
    "Failed to get OpenTok sessionId and token. Make sure you have updated the config.js file."
  );
}
