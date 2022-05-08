import Draw from "./src/main";

window.onload = function () {
  const canvasEl = document.getElementById("canvas-ref");
  const drawInstance = new Draw({ el: canvasEl });
  console.log(drawInstance);
};
