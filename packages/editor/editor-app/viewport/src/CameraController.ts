/**
 * @zh 编辑器相机控制器模块
 * @en Editor camera controller module
 */

import { getCC, type CC, type Camera, type Vec3 } from './types';

/**
 * @zh 相机状态
 * @en Camera state
 */
interface CameraState {
  /**
   * @zh 相机世界坐标位置
   * @en Camera world position
   */
  position: Vec3;

  /**
   * @zh 偏航角（弧度），绕Y轴旋转
   * @en Yaw angle (radians), rotation around Y axis
   */
  yaw: number;

  /**
   * @zh 俯仰角（弧度），绕X轴旋转
   * @en Pitch angle (radians), rotation around X axis
   */
  pitch: number;
}

/**
 * @zh 键盘按键状态
 * @en Keyboard key states
 */
interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  q: boolean;
  e: boolean;
  shift: boolean;
}

/**
 * @zh 编辑器相机控制器
 * @en Editor camera controller
 */
export class CameraController {
  private cc: CC;
  private camera: Camera | null = null;
  private canvas: HTMLCanvasElement | null = null;

  private state: CameraState;
  private isDragging = false;
  private isPanning = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  private keys: KeyState = {
    w: false, a: false, s: false, d: false,
    q: false, e: false, shift: false,
  };
  private keyboardUpdateId: number | null = null;

  private readonly rotateSpeed = 0.003;
  private readonly panSpeed = 0.01;
  private readonly zoomSpeed = 0.5;
  private readonly keyMoveSpeed = 0.3;
  private readonly keyMoveSpeedFast = 1.0;
  private readonly minPitch = -Math.PI / 2 + 0.1;
  private readonly maxPitch = Math.PI / 2 - 0.1;

  constructor() {
    this.cc = getCC();
    this.state = {
      position: this.cc.v3(5, 5, 10),
      yaw: -Math.PI / 6,
      pitch: -Math.PI / 8,
    };
  }

  /**
   * @zh 初始化相机控制器
   * @en Initialize camera controller
   *
   * @param camera - @zh 要控制的相机组件 @en Camera component to control
   * @param canvas - @zh 接收输入事件的画布元素 @en Canvas element for input events
   */
  init(camera: Camera, canvas: HTMLCanvasElement): void {
    this.camera = camera;
    this.canvas = canvas;
    this.bindEvents();
    this.updateCameraTransform();
  }

  /**
   * @zh 销毁控制器，移除所有事件监听
   * @en Destroy controller, remove all event listeners
   */
  destroy(): void {
    if (!this.canvas) return;
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);
    this.canvas.removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('keyup', this.onKeyUp);
    this.stopKeyboardLoop();
  }

  /**
   * @zh 聚焦到指定位置
   * @en Focus on specified position
   *
   * @param target - @zh 目标世界坐标 @en Target world position
   * @param distance - @zh 相机与目标的距离 @en Distance from camera to target
   */
  focusOn(target: Vec3, distance = 10): void {
    this.state.position.set(target.x, target.y + distance * 0.3, target.z + distance);
    this.state.yaw = 0;
    this.state.pitch = -Math.PI / 10;
    this.updateCameraTransform();
  }

  /**
   * @zh 重置相机到默认位置和角度
   * @en Reset camera to default position and angles
   */
  reset(): void {
    this.state.position.set(5, 5, 10);
    this.state.yaw = -Math.PI / 6;
    this.state.pitch = -Math.PI / 8;
    this.updateCameraTransform();
  }

  /**
   * @zh 设置预设视角
   * @en Set preset view direction
   *
   * @param direction - @zh 视角方向 @en View direction
   *   - top: @zh 顶视图 @en Top view
   *   - front: @zh 前视图 @en Front view
   *   - right: @zh 右视图 @en Right view
   *   - perspective: @zh 透视图 @en Perspective view
   */
  setView(direction: 'top' | 'front' | 'right' | 'perspective'): void {
    switch (direction) {
      case 'top':
        this.state.yaw = 0;
        this.state.pitch = -Math.PI / 2 + 0.01;
        break;
      case 'front':
        this.state.yaw = 0;
        this.state.pitch = 0;
        break;
      case 'right':
        this.state.yaw = Math.PI / 2;
        this.state.pitch = 0;
        break;
      case 'perspective':
        this.state.yaw = -Math.PI / 6;
        this.state.pitch = -Math.PI / 8;
        break;
    }
    this.updateCameraTransform();
  }

  private bindEvents(): void {
    if (!this.canvas) return;

    this.canvas.tabIndex = 0;
    this.canvas.style.outline = 'none';
    this.canvas.focus();

    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('auxclick', (e) => e.preventDefault());
    this.canvas.addEventListener('keydown', this.onKeyDown);
    this.canvas.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('click', () => this.canvas?.focus());

    this.startKeyboardLoop();
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
    }
    if (e.button === 0) {
      this.isDragging = true;
    } else if (e.button === 1 || e.button === 2) {
      this.isPanning = true;
    }
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.canvas?.focus();

    // Capture mouse events at window level to continue tracking outside viewport
    if (this.isDragging || this.isPanning) {
      window.addEventListener('mousemove', this.onWindowMouseMove);
      window.addEventListener('mouseup', this.onWindowMouseUp);
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging && !this.isPanning) return;
    this.handleMouseMove(e.clientX, e.clientY);
  };

  private onWindowMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging && !this.isPanning) return;
    this.handleMouseMove(e.clientX, e.clientY);
  };

  private handleMouseMove(clientX: number, clientY: number): void {
    const deltaX = clientX - this.lastMouseX;
    const deltaY = clientY - this.lastMouseY;
    this.lastMouseX = clientX;
    this.lastMouseY = clientY;

    if (this.isDragging) {
      this.rotate(deltaX, deltaY);
    } else if (this.isPanning) {
      this.pan(deltaX, deltaY);
    }
  }

  private onMouseUp = (): void => {
    this.stopDragging();
  };

  private onWindowMouseUp = (): void => {
    this.stopDragging();
  };

  private stopDragging(): void {
    this.isDragging = false;
    this.isPanning = false;
    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);
  }

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.zoom(e.deltaY > 0 ? -1 : 1);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();
    if (key in this.keys) {
      this.keys[key as keyof KeyState] = true;
    }
    if (e.shiftKey) {
      this.keys.shift = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();
    if (key in this.keys) {
      this.keys[key as keyof KeyState] = false;
    }
    if (!e.shiftKey) {
      this.keys.shift = false;
    }
  };

  private startKeyboardLoop(): void {
    const update = (): void => {
      this.updateKeyboardMovement();
      this.keyboardUpdateId = requestAnimationFrame(update);
    };
    this.keyboardUpdateId = requestAnimationFrame(update);
  }

  private stopKeyboardLoop(): void {
    if (this.keyboardUpdateId !== null) {
      cancelAnimationFrame(this.keyboardUpdateId);
      this.keyboardUpdateId = null;
    }
  }

  private updateKeyboardMovement(): void {
    if (!this.camera) return;

    const { w, a, s, d, q, e, shift } = this.keys;
    if (!w && !a && !s && !d && !q && !e) return;

    const speed = shift ? this.keyMoveSpeedFast : this.keyMoveSpeed;
    const cosYaw = Math.cos(this.state.yaw);
    const sinYaw = Math.sin(this.state.yaw);
    const forwardX = -sinYaw;
    const forwardZ = -cosYaw;
    const rightX = cosYaw;
    const rightZ = -sinYaw;

    if (w) {
      this.state.position.x += forwardX * speed;
      this.state.position.z += forwardZ * speed;
    }
    if (s) {
      this.state.position.x -= forwardX * speed;
      this.state.position.z -= forwardZ * speed;
    }
    if (a) {
      this.state.position.x -= rightX * speed;
      this.state.position.z -= rightZ * speed;
    }
    if (d) {
      this.state.position.x += rightX * speed;
      this.state.position.z += rightZ * speed;
    }
    if (q) {
      this.state.position.y -= speed;
    }
    if (e) {
      this.state.position.y += speed;
    }

    this.updateCameraTransform();
  }

  private rotate(deltaX: number, deltaY: number): void {
    this.state.yaw -= deltaX * this.rotateSpeed;
    this.state.pitch -= deltaY * this.rotateSpeed;
    this.state.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.state.pitch));
    this.updateCameraTransform();
  }

  private pan(deltaX: number, deltaY: number): void {
    if (!this.camera) return;

    const node = this.camera.node;
    const right = node.right;
    const up = node.up;
    const scale = this.panSpeed;

    this.state.position.x -= right.x * deltaX * scale;
    this.state.position.y -= right.y * deltaX * scale;
    this.state.position.z -= right.z * deltaX * scale;

    this.state.position.x += up.x * deltaY * scale;
    this.state.position.y += up.y * deltaY * scale;
    this.state.position.z += up.z * deltaY * scale;

    this.updateCameraTransform();
  }

  private zoom(delta: number): void {
    if (!this.camera) return;

    const node = this.camera.node;
    const forward = node.forward;
    const moveAmount = delta * this.zoomSpeed;

    this.state.position.x += forward.x * moveAmount;
    this.state.position.y += forward.y * moveAmount;
    this.state.position.z += forward.z * moveAmount;

    this.updateCameraTransform();
  }

  private updateCameraTransform(): void {
    if (!this.camera) return;

    const node = this.camera.node;
    const { position, yaw, pitch } = this.state;

    node.setPosition(position.x, position.y, position.z);

    const euler = this.cc.v3(
      pitch * 180 / Math.PI,
      yaw * 180 / Math.PI,
      0
    );
    node.setRotationFromEuler(euler);
  }
}

let instance: CameraController | null = null;

/**
 * @zh 获取相机控制器单例
 * @en Get camera controller singleton
 *
 * @returns @zh 相机控制器实例 @en Camera controller instance
 */
export function getCameraController(): CameraController {
  if (!instance) {
    instance = new CameraController();
  }
  return instance;
}
