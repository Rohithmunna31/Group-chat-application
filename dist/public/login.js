document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  axios
    .post("/user/login", {
      email,
      password,
    })
    .then((res) => {
      console.log(res.data);
      alert('log succesfull')
    })
    .catch((err) => {
      document.getElementById("display").innerHTML +=
        "<p style='color: red; > User login failed </p>";
    });
});

document.getElementById("gotosignup").addEventListener("click", (e) => {
  window.location.href = "/user/signup";
});
