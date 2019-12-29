import { WebGLUnavailable } from './modules/constant.js';
import GameFrame from './modules/core/GameFrame.js';
import Map from './modules/core/Map.js';
import MapLoader from './modules/loaders/MapLoader.js';
import { ResourceLoader } from './modules/loaders/ResourceLoader.js';
import StaticRenderer from './modules/renderers/StaticRenderer.js';
import { checkWebGLVersion, disposeResources } from './modules/utils.js';
import { UIController } from './UIController.js';

const canvas = document.querySelector('canvas');
const frame = new GameFrame(canvas);

/**
 * 游戏主函数，在资源加载完成后执行
 * @param mapInfo - 地图数据对象
 * @param resList - 总资源列表
 */
function main(mapInfo, resList) {
  let map; // 全局当前地图对象
  const staticRenderer = new StaticRenderer(frame);
  const staticRender = staticRenderer.requestRender.bind(staticRenderer);
  /**
   * 根据地图数据创建地图及建筑
   * @param mapData - json格式的地图数据
   */
  function createMap(mapData) {
    map = new Map(mapData, resList); // 初始化地图
    map.createMap(frame);
  }
  createMap(JSON.parse(JSON.stringify(mapInfo))); // 创建地图
  staticRenderer.requestRender(); // 发出渲染请求
  frame.controls.addEventListener('change', staticRender);
  window.addEventListener('resize', staticRender);
}
if (checkWebGLVersion() !== WebGLUnavailable) { // 检测webgl可用性，返回WebGLUnavailable时不支持webgl
  /* 加载总资源列表 */
  fetch('res/list.json')
    .then((resResp) => resResp.json())
    .then((resList) => {
      /**
       * 加载地图需求的各类资源到总资源列表
       * @param mapData: 地图信息文件数据
       */
      function loadResources(mapData) {
        disposeResources(frame.scene); // 加载新资源前废弃原地图中的资源
        let errorCounter = 0;
        /** 加载进度监控函数 */
        const loadingProgress = (_, itemsLoaded, itemsTotal) => {
          if (!errorCounter) {
            UIController.updateLoadingBar(itemsLoaded, itemsTotal);
          } // 没有加载错误时更新百分比
        };
        /** 加载错误处理函数 */
        const loadingError = (url) => {
          errorCounter += 1;
          UIController.updateTip(`\n加载${url}时发生错误`);
        };
        /** 加载完成回调函数 */
        const loadingFinished = (list) => {
          if (!errorCounter) {
            UIController.loadingToGameFrame();
            main(mapData, list);
          }
        };
        const resLoader = new ResourceLoader(resList, loadingFinished, loadingProgress, loadingError);
        resLoader.load(mapData.resources);
      }
      const mapLoader = new MapLoader(loadResources); // 地图信息加载器
      UIController.initUI();
      UIController.mapSelectToLoading(mapLoader);
    })
    .catch((reason) => { console.error('加载总资源列表错误', reason); });
}
