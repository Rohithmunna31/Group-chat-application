console.log("hello");

const btn = document.getElementById("submit");
if (btn) {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const mobilenoInput = document.getElementById("mobileno");
    const passwordInput = document.getElementById("password");
    const username = usernameInput.value;
    const email = emailInput.value;
    const mobileno = mobilenoInput.value;
    const password = passwordInput.value;
    axios_1.default
      .post("/user/signup", {
        username,
        email,
        mobileno,
        password,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        document.body.innerHTML += "Error signing up try logging in";
      });
  });
}
