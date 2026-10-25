/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../constants';

export interface ViewportMetrics {
  scale: number;
  dpr: number;
  displayWidth: number;
  displayHeight: number;
  physicalWidth: number;
  physicalHeight: number;
  offsetX: number;
  offsetY: number;
  containerWidth: number;
  containerHeight: number;
  isPortrait: boolean;
}

export class Viewport {
  public readonly virtualWidth = VIRTUAL_WIDTH;
  public readonly virtualHeight = VIRTUAL_HEIGHT;

  public metrics: ViewportMetrics = {
    scale: 1,
    dpr: 1,
    displayWidth: VIRTUAL_WIDTH,
    displayHeight: VIRTUAL_HEIGHT,
    physicalWidth: VIRTUAL_WIDTH,
    physicalHeight: VIRTUAL_HEIGHT,
    offsetX: 0,
    offsetY: 0,
    containerWidth: VIRTUAL_WIDTH,
    containerHeight: VIRTUAL_HEIGHT,
    isPortrait: false,
  };

  /**
   * Recalculates viewport scaling and offsets based on container dimensions and DPR
   */
  public update(containerWidth: number, containerHeight: number): ViewportMetrics {
    const dpr = Math.min(window.devicePixelRatio || 1, 3); // Cap at 3x for performance
    const isPortrait = containerHeight > containerWidth;

    // Maintain strict 16:9 virtual aspect ratio
    const scale = Math.min(
      containerWidth / this.virtualWidth,
      containerHeight / this.virtualHeight
    );

    const displayWidth = Math.round(this.virtualWidth * scale);
    const displayHeight = Math.round(this.virtualHeight * scale);

    const physicalWidth = Math.round(displayWidth * dpr);
    const physicalHeight = Math.round(displayHeight * dpr);

    const offsetX = Math.round((containerWidth - displayWidth) / 2);
    const offsetY = Math.round((containerHeight - displayHeight) / 2);

    this.metrics = {
      scale,
      dpr,
      displayWidth,
      displayHeight,
      physicalWidth,
      physicalHeight,
      offsetX,
      offsetY,
      containerWidth,
      containerHeight,
      isPortrait,
    };

    return this.metrics;
  }

  /**
   * Translates client (screen/touch) coordinates into virtual game coordinates [0..1280, 0..720]
   */
  public clientToVirtual(clientX: number, clientY: number, canvasRect: DOMRect): { x: number; y: number } {
    const relX = clientX - canvasRect.left;
    const relY = clientY - canvasRect.top;

    const virtualX = (relX / canvasRect.width) * this.virtualWidth;
    const virtualY = (relY / canvasRect.height) * this.virtualHeight;

    return {
      x: Math.max(0, Math.min(this.virtualWidth, virtualX)),
      y: Math.max(0, Math.min(this.virtualHeight, virtualY)),
    };
  }

  /**
   * Applies the transformation to the CanvasRenderingContext2D
   */
  public applyTransform(ctx: CanvasRenderingContext2D) {
    const { scale, dpr } = this.metrics;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  }
}

export const gameViewport = new Viewport();
