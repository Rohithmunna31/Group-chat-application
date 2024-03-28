const { default: axios } = require("axios");

document.getElementById("sendmessage").addEventListener("click", (e) => {
  e.preventDefault();

  const message = document.getElementById("inputmessage").value;
  const token = localStorage.getItem("token");

  axios
    .post("/groupchat", {
      message,
      Authorization: token,
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});
