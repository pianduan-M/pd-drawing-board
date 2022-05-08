import { transformMouse } from "./utils";
import { fabric } from "fabric";

export default class Polygon {
  // fabric 实例

  polygonMode;
  pointArray;
  lineArray;

  strokeColor;
  strokeWidth;
  fill;
  opacity;
  customInfo;
  // 绘画时的 polygon
  activeShape;
  activeLine;

  constructor(drawInstance) {
    this.drawInstance = drawInstance;

    this.canvas = drawInstance.canvas;

    this.strokeColor = "red";
    this.fill = "red";
    this.strokeWidth = 2;
    this.opacity = 1;
    this.customInfo = {};
    this.polygonMode = false;

    this.drawPolygon();
  }

  drawPolygon() {
    this.polygonMode = true;
    this.pointArray = []; // 顶点集合
    this.lineArray = []; //线集合
  }

  onMouseDown(e) {
    // 记录鼠标按下时的坐标
    // let xy = e.pointer || transformMouse(e.e.offsetX, e.e.offsetY);
    // this.mouseFrom.x = xy.x;
    // this.mouseFrom.y = xy.y;
    this.doDrawing = true;

    this.canvas.skipTargetFind = false;
    try {
      // 此段为判断是否闭合多边形，点击红点时闭合多边形
      if (this.pointArray.length > 1) {
        // e.target.id == this.pointArray[0].id 表示点击了初始红点
        if (e.target && e.target.id == this.pointArray[0].id) {
          this.handleDonePolygon();
          return;
        }
      }
      //未点击红点则继续作画
      if (this.polygonMode) {
        this.addPoint(e);
      }
    } catch (error) {
      console.log(error);
    }
  }

  onMousemove(e) {
    if (this.activeLine && this.activeLine.class == "line") {
      let pointer = this.canvas.getPointer(e.e);
      this.activeLine.set({ x2: pointer.x, y2: pointer.y });
      let points = this.activeShape.get("points");
      points[this.pointArray.length] = {
        x: pointer.x,
        y: pointer.y,
        zIndex: 1,
      };
      this.activeShape.set({
        points: points,
      });
      this.canvas.renderAll();
    }
    this.canvas.renderAll();
  }

  addPoint(e) {
    console.log("addPoint");
    // 超出画布
    // if (!this.drawInstance.validatePoint(e)) {
    //   return;
    // }

    let random = Math.floor(Math.random() * 10000);
    let id = new Date().getTime() + random;
    let circleTop = (e.pointer.y || e.e.layerY) / this.canvas.getZoom();
    let circleLeft = (e.pointer.x || e.e.layerX) / this.canvas.getZoom();

    let circle = this.genDrawingFabricCircle({
      left: circleLeft,
      top: circleTop,
      id,
    });

    if (this.pointArray.length == 0) {
      circle.set({
        fill: "red",
      });
    }
    let points = [
      (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
      (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
      (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
      (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
    ];

    this.line = this.genDrawingFabricLine(points);

    if (this.activeShape) {
      let pos = this.canvas.getPointer(e.e);
      let points = this.activeShape.get("points");
      points.push({
        x: pos.x,
        y: pos.y,
      });

      let polygon = this.genDrawingFabricPolygon(points);

      this.canvas.remove(this.activeShape);
      this.canvas.add(polygon);
      this.activeShape = polygon;
    } else {
      let polyPoint = [
        {
          x: (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
          y: (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
        },
      ];

      let polygon = this.genDrawingFabricPolygon(polyPoint);

      this.activeShape = polygon;
      this.canvas.add(polygon);
    }
    this.activeLine = this.line;
    this.pointArray.push(circle);
    this.lineArray.push(this.line);
    this.canvas.add(this.line);
    this.canvas.add(circle);
    this.canvas.renderAll();
  }

  // 合闭 路径 绘制图形
  handleDonePolygon() {
    if (this.pointArray.length < 3) {
    }

    this.handleDrawPolygon();
  }

  // 绘制多边形
  handleDrawPolygon() {
    let points = [];
    this.pointArray.map((point, index) => {
      points.push({
        x: point.left,
        y: point.top,
      });
      this.canvas.remove(point);
    });
    this.lineArray.map((line, index) => {
      this.canvas.remove(line);
    });

    const fabricPolygon = this.genFabricPolygon(points);

    this.addFabricShape();

    this.canvas.renderAll();

    this.activeObject = fabricPolygon;

    this.handleOpenObjectBorder();
  }

  addFabricShape(fabricShape) {
    this.canvas.add(fabricShape);
  }

  // 关闭绘画
  closeDraw() {
    this.activeLine = null;
    this.pointArray = null;
    this.activeShape = null;
    this.polygonMode = false;
    this.doDrawing = false;
  }

  genDrawingFabricPolygon(polyPoint) {
    return new fabric.Polygon(polyPoint, {
      stroke: this.strokeColor,
      strokeWidth: this.strokeWidth,
      fill: this.fill,
      opacity: 0.5,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false,
    });
  }
  genDrawingFabricLine(points) {
    return new fabric.Line(points, {
      fill: this.fill,
      stroke: this.strokeColor,
      strokeWidth: this.strokeWidth,
      class: "line",
      originX: "center",
      originY: "center",
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false,
    });
  }
  genDrawingFabricCircle({ left, top, id = "1" }) {
    return new fabric.Circle({
      radius: 5,
      fill: "#ffffff",
      stroke: "#333333",
      strokeWidth: 0.5,
      left,
      top,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: "center",
      originY: "center",
      id: id,
      objectCaching: false,
    });
  }
  // 根据传过来的点位生成一个 polygon
  genFabricPolygon(points) {
    let polygon = new fabric.Polygon(points, {
      stroke: this.strokeColor,
      strokeWidth: this.strokeWidth,
      fill: this.fill,
      opacity: this.opacity,
      hasBorders: true,
      hasControls: false,
      selection: false,
      customInfo: this.customInfo,
      lockMovementX: true,
      lockMovementY: true,
    });

    return polygon;
  }
}
