/**
 * 基础建筑类
 * @author: 落日羽音
 */

import * as THREE from '../../lib/three/build/three.module.js';
import { BlockUnit } from '../constant.js';


class Building {
  /**
   * 创建标准化地图建筑对象
   * @param mesh: 建筑网格实体
   * @param info: 建筑信息对象
   */
  constructor(mesh, info) {
    this.colSpan = info.colSpan ? info.colSpan : 1;
    this.rowSpan = info.rowSpan ? info.rowSpan : 1;
    const rotation = info.rotation ? info.rotation : 0;
    const sizeAlpha = info.sizeAlpha ? info.sizeAlpha : 1;
    mesh.rotation.y = THREE.Math.degToRad(rotation);
    mesh.geometry.center(); // 重置原点为几何中心
    mesh.geometry.computeBoundingBox();
    mesh.geometry.boundingBox.getCenter(mesh.position);
    const wrapper = new THREE.Object3D(); // 使用外部对象包裹
    wrapper.add(mesh);
    const originBox = new THREE.Box3().setFromObject(wrapper);
    const originSize = originBox.getSize(new THREE.Vector3());
    const magX = (BlockUnit * this.colSpan * sizeAlpha - 0.02) / originSize.x;
    const magZ = (BlockUnit * this.rowSpan * sizeAlpha - 0.02) / originSize.z;
    const magY = Math.min(magX, magZ);
    wrapper.scale.set(magX, magY, magZ);
    this.mesh = wrapper;
    const box = new THREE.Box3().setFromObject(this.mesh);
    this.size = new THREE.Vector3(); // 缩放后的尺寸
    box.getSize(this.size);
  }
}
export default Building;
