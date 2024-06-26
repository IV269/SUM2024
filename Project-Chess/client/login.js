function nextPage() {
    const mess = document.getElementById("fromlogin");
    const Name = document.getElementById("name");
    localStorage.setItem("Name", Name.data);
    if (mess != undefined) {
        window.location = "./board.html";
    }
}

window.addEventListener("load", () => {
    let btn = document.getElementById("fromlogin");
    if (btn != undefined) {
        btn.addEventListener("click", (e) => {
            nextPage();
        });
    }
});
