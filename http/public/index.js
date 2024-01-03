document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".js-hello");

  button.addEventListener("click", () => {
    alert("hello!");
  });
  console.log(button);
});
