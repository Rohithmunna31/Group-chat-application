const io = require("socket.io-client");
const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("displaying messages from socket id");
});
document.getElementById("displayerror").innerHTML = "";

window.addEventListener("load", (event) => {
  console.log("page fully loaded");
  document.getElementById("displayerror").innerHTML = "";
});
const urls = window.location.href.split("/");
console.log(urls);
const groupid = urls[urls.length - 2];
const groupname = urls[urls.length - 1];

document.getElementById("groupname").innerHTML = `Group name : ${groupname}`;

const token = localStorage.getItem("token");
let messageid = 0;
let localMessages = null;
localStorage.setItem("localMessages", localMessages);

const fetchAndDisplayMessages = () => {
  axios
    .post(`http://localhost:3000/group/chats/${messageid}/${groupid}`, {
      Authorization: token,
    })
    .then((res) => {
      const thisgroupusers = res.data.thisgroupusers;
      console.log("res.data", res.data);

      console.log("in fetch and display functions");
      let localMessages = localStorage.getItem("localMessages");
      localMessages = JSON.parse(localMessages);
      const allMessages = res.data.allMessages;
      document.getElementById("displaymessages").innerHTML = "";

      if (localMessages) {
        for (let i = 0; i < localMessages.length; i++) {
          document.getElementById(
            "displaymessages"
          ).innerHTML += `<p> ${localMessages[i].User.username} : ${localMessages[i].message} </p>`;
          console.log("in local storage messages");
        }
      }

      if (allMessages) {
        for (let i = 0; i < allMessages.length; i++) {
          document.getElementById(
            "displaymessages"
          ).innerHTML += `<p> ${allMessages[i].User.username} : ${allMessages[i].message} </p>`;
          console.log("in backend messages");
        }
      }

      if (localMessages && localMessages.concat(allMessages).length <= 1000) {
        localStorage.setItem(
          "localMessages",
          JSON.stringify(localMessages.concat(allMessages))
        );
      }

      console.log(localStorage.getItem("localMessages"));
      let Messages = localStorage.getItem("localMessages");
      Messages = JSON.parse(Messages);

      if (Messages) {
        messageid = Messages.length;
        console.log("messageid", messageid);
      }
    });
};
// setInterval(fetchAndDisplayMessages, 1000);
fetchAndDisplayMessages();

document.getElementById("sendmessage").addEventListener("click", (e) => {
  e.preventDefault();

  const message = document.getElementById("inputmessage").value;
  const token = localStorage.getItem("token");

  axios
    .post(`/group/chat/${groupid}/${groupname}`, {
      message,
      Authorization: token,
    })
    .then((res) => {
      document.getElementById(
        "displaymessages"
      ).innerHTML += `<p> you : ${res.data.message} <p/>`;
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});

document.getElementById("invitelink").addEventListener("click", (e) => {
  const invitationlink = document.getElementById("invitationlink");

  console.log("am i coming here invite link");

  invitationlink.innerHTML = ` http://localhost:3000/group/joingroup/${groupid}`;

  invitationlink.style.position = "fixed";

  invitationlink.style.top = "5rem";
  invitationlink.style.right = "2rem";
});

document.getElementById("hideinvite").addEventListener("click", (e) => {
  const invitationlink = document.getElementById("invitationlink");

  invitationlink.innerHTML = "";
});

axios
  .post(`/group/getusers/${groupid}`, { Authorization: token })
  .then((res) => {
    console.log(res.data);

    const isAdmin = res.data.isadmin;

    if (isAdmin) {
      console.log("am i admin");
      document.getElementById("isadmin").innerHTML = "Admin";
      const usersList = document.getElementById("userslist");
      usersList.innerHTML = ""; // Clear previous content

      const thisGroupUsers = res.data.thisgroupsusers;

      thisGroupUsers.forEach((user) => {
        const userDiv = document.createElement("div");

        // Create username button
        const userLink = document.createElement("button");
        userLink.className = "username-btn";
        userLink.innerText = user.username;
        userDiv.appendChild(userLink);

        userDiv.appendChild(document.createElement("br"));
        // Create "Remove User" button
        const removeButton = document.createElement("button");
        removeButton.className = "action-btn";
        removeButton.innerText = "Remove User";
        userDiv.appendChild(removeButton);

        removeButton.addEventListener("click", () => {
          axios
            .get(`/user/removeuser/${groupid}/${user.id}`)
            .then((res) => {})
            .catch((err) => {});
        });

        // Create "Make Admin" button
        const makeAdminButton = document.createElement("button");
        makeAdminButton.className = "action-btn";
        makeAdminButton.innerText = "Make Admin";
        userDiv.appendChild(makeAdminButton);

        axios
          .get(`/user/makeadmin/${groupid}/${user.id}`)
          .then((res) => {
            console.log("success");
            // document.getElementById(
            //   "displayerror"
            // ).innerHTML = `${res.data.message}`;
          })
          .catch((err) => {
            console.log("err");
            document.getElementById(
              "displayerror"
            ).innerHTML = `${err.message}`;
          });
        usersList.appendChild(userDiv);
      });
    } else {
      document.getElementById("isadmin").innerHTML = "Not an Admin";

      const adduserinput = document.getElementById("add-user-input");
      adduserinput.style.visibility = "hidden";
    }
  })

  .catch((err) => {
    console.log(err);
  });

function displaysearchusers() {
  const searchInput = document.getElementById("username-input").value;
  console.log("iam in searching users and its working");
  axios
    .post(`/user/searchusers`, {
      query: searchInput,
    })
    .then((res) => {
      console.log("search users", res.data);
      displaySearchResults(res.data.users);
    })
    .catch((err) => {
      console.log(err);
    });
}

document.getElementById("searchuser").addEventListener("click", () => {
  displaysearchusers();
});

function displaySearchResults(users) {
  const searchResultsContainer = document.getElementById("searchResults");
  searchResultsContainer.innerHTML = "";

  if (users.length === 0) {
    searchResultsContainer.innerHTML = "<p>No users found</p>";
    searchResultsContainer.classList.remove("visible"); // Hide results container
    return;
  }

  const userListContainer = document.createElement("ul");
  users.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.classList.add("userItem");
    userItem.textContent = `${user.username}`;
    userListContainer.appendChild(userItem);
  });

  searchResultsContainer.appendChild(userListContainer);
  searchResultsContainer.classList.add("visible"); // Show results container
}

function clearSearchResults() {
  document.getElementById("searchResults").innerHTML = "";
  document.getElementById("searchResults").classList.remove("visible");
}

// Add event listener to clear search results when clicking anywhere on the page
document.body.addEventListener("click", () => {
  clearSearchResults();
});

document.getElementById("add-user-button").addEventListener("click", () => {
  const username = document.getElementById("username-input").value;

  axios
    .post(`/user/adduser/${groupid}`, { username })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});
