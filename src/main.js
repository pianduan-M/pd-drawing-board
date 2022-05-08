import { fabric } from "fabric";
import Polygon from "./polygon";

export default class Main {
  canvas;
  canvasEl;
  _width;
  _height;
  scaleX;
  scaleY;
  bgImg;
  bgImgUrl;
  _drawType;
  mouseFrom;

  constructor({ el }) {
    this.canvasEl = el;

    this.mouseFrom = { x: 0, y: 0 };

    this._init();
    this.polygon = new Polygon(this);

    this.canvasAddEventListener();
  }

  set width(val) {
    this._width = val;
    // this.canvasEl.width = val
    // this.canvasEl.style.width = val + 'px'
    this.canvas && this.canvas.setWidth(this.width);
  }

  get width() {
    return this._width;
  }

  set height(val) {
    this._height = val;
    // this.canvasEl.height = val
    // this.canvasEl.style.height = val + 'px'
    this.canvas && this.canvas.setHeight(this.height);
  }

  get height() {
    return this._height;
  }

  get drawType() {
    return this._drawType;
  }

  set drawType(value) {
    this._drawType = value;
  }

  _init(bgImgUrl) {
    // 1. 实例化canvas 画布
    this.width = this.canvasEl.offsetWidth;
    this.height = this.canvasEl.offsetHeight;

    this.canvas = new fabric.Canvas(this.canvasEl, {
      width: this.width,
      height: this.height,
    });

    return new Promise(async (resolve, reject) => {
      if (bgImgUrl) {
        this.bgImgUrl = bgImgUrl;

        try {
          const fabricImageInstance = await this.createImageFromURL(bgImgUrl);
          this.setBackgroundImage(fabricImageInstance);
        } catch (error) {
          reject(error);
        }
      }
      resolve();
    });
  }

  // canvas 监听事件
  canvasAddEventListener() {
    //鼠标按下事件
    this.canvas.on("mouse:down", (e) => {
      // this.panning = true;
      // this.canvas.selection = false;

      // 记录当前鼠标的起点坐标 (减去画布在 x y轴的偏移，因为画布左上角坐标不一定在浏览器的窗口左上角)
      // this.mouseFrom.x = e.e.clientX - this.canvas._offset.left;
      // this.mouseFrom.y = e.e.clientY - this.canvas._offset.top;

      this.polygon.onMouseDown(e);
    });

    //鼠标抬起事件
    this.canvas.on("mouse:up", (e) => {
      this.panning = false;
      this.canvas.selection = true;
    });

    // 移动画布事件
    this.canvas.on("mouse:move", (e) => {
      this.polygon.onMousemove(e);

      if (!this.panning) return;
      // 移动画布
      // if (this.panning && this.isSpace && e && e.e) {
      //   let delta = new fabric.Point(e.e.movementX, e.e.movementY);
      //   this.canvas.relativePan(delta);
      // }

      // 记录当前鼠标移动终点坐标 (减去画布在 x y轴的偏移，因为画布左上角坐标不一定在浏览器的窗口左上角)
      // this.mouseTo.x = e.e.clientX - this.canvas._offset.left;
      // this.mouseTo.y = e.e.clientY - this.canvas._offset.top;
    });

    // 鼠标滚动画布放大缩小
    // this.canvas.on("mouse:wheel", ({ e }) => {
    //   // 按住 alt 键滚轮缩放
    //   if (!e.altKey) return

    //   let zoom = (e.deltaY > 0 ? -0.1 : 0.1) + this.canvas.getZoom();

    //   zoom = Math.max(0.1, zoom); //最小为原来的1/10
    //   zoom = Math.min(3, zoom); //最大是原来的3倍
    //   let zoomPoint = new fabric.Point(e.pageX, e.pageY);
    //   this.canvas.zoomToPoint(zoomPoint, zoom);
    // });
  }

  setBackgroundImage(img) {
    this.bgImg = img;
    this.scaleX = parseFloat((this.width / img.width).toFixed(2));
    // this.scaleY = (this.canvas.height / img.height).toFixed(2);
    this.scaleY = this.scaleX;

    this.height = img.height * this.scaleX;

    this.canvas.setBackgroundImage(
      img,
      this.canvas.renderAll.bind(this.canvas),
      {
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        crossOrigin: "anonymous",
        originX: "left",
        originY: "top",
      }
    );
  }

  createImageFromURL(imgUrl) {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(
        imgUrl,
        (img, error) => {
          if (error) {
            return reject("image error");
          }
          resolve(img);
        },
        {
          crossOrigin: "anonymous",
        }
      );
    });
  }

  removeAllObjects() {
    const Objects = this.canvas.getObjects();
    this.canvas.remove(...Objects);
  }

  dispose() {
    this.canvas.removeListeners();
    this.canvas.dispose();
  }

  transformPointByImage({ x, y }) {
    x = x * parseFloat(this.width);
    y = y * parseFloat(this.height);
    return {
      x,
      y,
    };
  }

  // 转换坐标点
  transformPointPos({ x, y }) {
    x = x * parseFloat(this.scaleX);
    y = y * parseFloat(this.scaleY);
    return {
      x,
      y,
    };
  }

  // 生成文本
  renderText(textObject) {
    this.canvas.add(textObject);
    this.canvas.renderAll();
  }

  generateText(text, info) {
    return new fabric.Text(text, info);
  }

  // 获取画布 base64
  getCanvasImage(params = {}) {
    params = Object.assign(
      {
        format: "jpeg",
        quality: 0.7,
      },
      params
    );
    return this.canvasEl.toDataURL(params);
  }

  // 开启边框
  handleOpenObjectBorder() {
    const objects = this.canvas.getObjects();
    objects.map((item) => {
      item.set({
        hasBorders: true,
      });
    });
    this.canvas.renderAll();
  }

  // 关闭边框
  handleCloseObjectBorder() {
    const objects = this.canvas.getObjects();
    objects.map((item) => {
      item.set({
        hasBorders: false,
      });
    });
    this.canvas.renderAll();
  }

  validatePoint(e) {
    const { pointer } = e;
    if (!pointer) return false;
    let { x, y } = pointer;
    x = x / this.scaleX;
    y = y / this.scaleY;

    const { width: bgImgWidth, height: bgImgHeight } = this.bgImg;

    if (x < 0 || x > bgImgWidth || y < 0 || y > bgImgHeight) {
      return false;
    }
    return true;
  }
}
