"use strict";
// ------------------------------------------------------------------
/// prevents edge artifacts due to bilinear filtering
/// Note: Some image editors like Photoshop tend to fill purely transparent pixel with
/// white color (R=1, G=1, B=1, A=0). This is generally OK, because these white pixels
/// are impossible to see in normal circumstances.  However, when such textures are
/// used in 3D with bilinear filtering, the shader will sometimes sample beyond visible
/// edges into purely transparent pixels and the white color stored there will bleed
/// into the visible edge.  This method scans the texture to find all purely transparent
/// pixels that have a visible neighbor pixel, and copy the color data from that neighbor
/// into the transparent pixel, while preserving its 0 alpha value.  In order to
/// optimize the algorithm for speed of execution, a compromise is made to use any
/// arbitrary neighboring pixel, as this should generally lead to correct results.
/// It also limits itself to the immediate neighbors around the edge, resulting in a
/// a bleed of a single pixel border around the edges, which should be fine, as bilinear
/// filtering should generally not sample beyond that one pixel range.
// ------------------------------------------------------------------
// X and Y offsets used in contour bleed for sampling all around each purely transparent pixel
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyContourBleed = applyContourBleed;
function applyContourBleed(resultBuffer, srcBuffer, width, rect, sampleXOffsets, sampleYOffsets, bufIdxOffsets) {
    if (rect.width === 0 || rect.height === 0) {
        return;
    }
    const start_x = rect.x;
    const end_x = rect.xMax;
    const start_y = rect.y;
    const end_y = rect.yMax;
    const pixelBytes = 4;
    const ditch = width * pixelBytes;
    let offsetIndex = 0;
    const offsetCount = sampleXOffsets.length;
    let sampleX = 0, sampleY = 0, sampleBufIdx = 0;
    let bufIdx = 0;
    let bufRowStart = start_y * ditch + start_x * pixelBytes;
    for (let y = start_y, x = 0; y < end_y; ++y, bufRowStart += ditch) {
        bufIdx = bufRowStart;
        for (x = start_x; x < end_x; ++x, bufIdx += pixelBytes) {
            // only needs to bleed into purely transparent pixels
            if (srcBuffer[bufIdx + 3] === 0) {
                // sample all around to find any non-purely transparent pixels
                for (offsetIndex = 0; offsetIndex < offsetCount; offsetIndex++) {
                    sampleX = x + sampleXOffsets[offsetIndex];
                    sampleY = y + sampleYOffsets[offsetIndex];
                    // check to stay within texture bounds
                    if (sampleX >= start_x && sampleX < end_x && sampleY >= start_y && sampleY < end_y) {
                        sampleBufIdx = bufIdx + bufIdxOffsets[offsetIndex];
                        if (srcBuffer[sampleBufIdx + 3] > 0) {
                            // Copy RGB color channels to purely transparent pixel, but preserving its 0 alpha
                            resultBuffer[bufIdx] = srcBuffer[sampleBufIdx];
                            resultBuffer[bufIdx + 1] = srcBuffer[sampleBufIdx + 1];
                            resultBuffer[bufIdx + 2] = srcBuffer[sampleBufIdx + 2];
                            break;
                        }
                    }
                }
            }
        }
    }
}
// ------------------------------------------------------------------
/// prevents border artifacts due to bilinear filtering
/// Note: Shaders with bilinear filtering will sometimes sample outside the bounds
/// of the element, in the padding area, resulting in the padding color to bleed
/// around the rectangular borders of the element.  This is true even when padding is
/// purely transparent, because in that case, it is the 0 alpha that bleeds into the
/// alpha of the outer pixels.  Such alpha bleed is especially problematic when
/// trying to seamlessly tile multiple rectangular textures, as semi-transparent seams
/// will sometimes appear at different scales.  This method duplicates a single row of
/// pixels from the inner border of an element into the padding area.  This technique
/// can be used with all kinds of textures without risk, even textures with uneven
/// transparent edges, as it only allows the shader to sample more of the same (opaque
/// or transparent) values when it exceeds the bounds of the element.
// ------------------------------------------------------------------
function applyPaddingBleed(resultBuffer, srcBuffer, width, height, rect) {
    if (rect.width === 0 || rect.height === 0) {
        return;
    }
    const yMin = rect.y;
    const yMax = rect.yMax - 1;
    const xMin = rect.x;
    const xMax = rect.xMax - 1;
    const pixelBytes = 4;
    const ditch = width * pixelBytes;
    const xBufMin = xMin * pixelBytes;
    const xBufMax = xMax * pixelBytes;
    const topRowStart = yMin * ditch;
    const botRowStart = yMax * ditch;
    let bufIdx = 0, bufEnd = 0;
    // copy top row of pixels
    if (yMin - 1 >= 0) {
        bufIdx = topRowStart + xBufMin;
        bufEnd = topRowStart + xBufMax + (pixelBytes - 1);
        for (; bufIdx <= bufEnd; ++bufIdx) {
            resultBuffer[bufIdx - ditch] = srcBuffer[bufIdx];
        }
    }
    // copy bottom row of pixels
    if (yMax + 1 < height) {
        bufIdx = botRowStart + xBufMin;
        bufEnd = botRowStart + xBufMax + (pixelBytes - 1);
        for (; bufIdx <= bufEnd; ++bufIdx) {
            resultBuffer[bufIdx + ditch] = srcBuffer[bufIdx];
        }
    }
    // copy left column of pixels
    if (xMin - 1 >= 0) {
        bufIdx = topRowStart + xBufMin;
        bufEnd = botRowStart + xBufMin;
        for (; bufIdx <= bufEnd; bufIdx += ditch) {
            resultBuffer[bufIdx - 4] = srcBuffer[bufIdx];
            resultBuffer[bufIdx - 3] = srcBuffer[bufIdx + 1];
            resultBuffer[bufIdx - 2] = srcBuffer[bufIdx + 2];
            resultBuffer[bufIdx - 1] = srcBuffer[bufIdx + 3];
        }
    }
    // copy right column of pixels
    if (xMax + 1 < width) {
        bufIdx = topRowStart + xBufMax;
        bufEnd = botRowStart + xBufMax;
        for (; bufIdx <= bufEnd; bufIdx += ditch) {
            resultBuffer[bufIdx + 4] = srcBuffer[bufIdx];
            resultBuffer[bufIdx + 5] = srcBuffer[bufIdx + 1];
            resultBuffer[bufIdx + 6] = srcBuffer[bufIdx + 2];
            resultBuffer[bufIdx + 7] = srcBuffer[bufIdx + 3];
        }
    }
    // copy corners
    if (xMin - 1 >= 0 && yMin - 1 >= 0) {
        for (bufIdx = topRowStart + xBufMin, bufEnd = bufIdx + 4; bufIdx < bufEnd; bufIdx++) {
            resultBuffer[bufIdx - ditch - pixelBytes] = srcBuffer[bufIdx];
        }
    }
    if (xMax + 1 < width && yMin - 1 >= 0) {
        for (bufIdx = topRowStart + xBufMax, bufEnd = bufIdx + 4; bufIdx < bufEnd; bufIdx++) {
            resultBuffer[bufIdx - ditch + pixelBytes] = srcBuffer[bufIdx];
        }
    }
    if (xMin - 1 >= 0 && yMax + 1 < height) {
        for (bufIdx = botRowStart + xBufMin, bufEnd = bufIdx + 4; bufIdx < bufEnd; bufIdx++) {
            resultBuffer[bufIdx + ditch - pixelBytes] = srcBuffer[bufIdx];
        }
    }
    if (xMax + 1 < width && yMax + 1 < height) {
        for (bufIdx = botRowStart + xBufMax, bufEnd = bufIdx + 4; bufIdx < bufEnd; bufIdx++) {
            resultBuffer[bufIdx + ditch + pixelBytes] = srcBuffer[bufIdx];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxlZWRpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvdXRpbHMvYWxnb3JpdGhtL2JsZWVkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxRUFBcUU7QUFDckUscURBQXFEO0FBQ3JELHNGQUFzRjtBQUN0RixzRkFBc0Y7QUFDdEYsbUZBQW1GO0FBQ25GLHVGQUF1RjtBQUN2RixvRkFBb0Y7QUFDcEYsd0ZBQXdGO0FBQ3hGLHlGQUF5RjtBQUN6RixnRkFBZ0Y7QUFDaEYsa0ZBQWtGO0FBQ2xGLGtGQUFrRjtBQUNsRixvRkFBb0Y7QUFDcEYsd0ZBQXdGO0FBQ3hGLHNFQUFzRTtBQUN0RSxxRUFBcUU7QUFDckUsOEZBQThGOztBQUU5Riw4Q0FvREM7QUFwREQsU0FBZ0IsaUJBQWlCLENBQzdCLFlBQW9CLEVBQ3BCLFNBQWlCLEVBQ2pCLEtBQWEsRUFDYixJQUF5RixFQUN6RixjQUF3QixFQUN4QixjQUF3QixFQUN4QixhQUF1QjtJQUV2QixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDeEMsT0FBTztJQUNYLENBQUM7SUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDeEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBRXhCLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNyQixNQUFNLEtBQUssR0FBRyxLQUFLLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNwQixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO0lBRTFDLElBQUksT0FBTyxHQUFHLENBQUMsRUFDWCxPQUFPLEdBQUcsQ0FBQyxFQUNYLFlBQVksR0FBRyxDQUFDLENBQUM7SUFDckIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxXQUFXLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsVUFBVSxDQUFDO0lBQ3pELEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxXQUFXLElBQUksS0FBSyxFQUFFLENBQUM7UUFDaEUsTUFBTSxHQUFHLFdBQVcsQ0FBQztRQUNyQixLQUFLLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxNQUFNLElBQUksVUFBVSxFQUFFLENBQUM7WUFDckQscURBQXFEO1lBQ3JELElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsOERBQThEO2dCQUM5RCxLQUFLLFdBQVcsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLFdBQVcsRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDO29CQUM3RCxPQUFPLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDMUMsT0FBTyxHQUFHLENBQUMsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQzFDLHNDQUFzQztvQkFDdEMsSUFBSSxPQUFPLElBQUksT0FBTyxJQUFJLE9BQU8sR0FBRyxLQUFLLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxPQUFPLEdBQUcsS0FBSyxFQUFFLENBQUM7d0JBQ2pGLFlBQVksR0FBRyxNQUFNLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLFNBQVMsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7NEJBQ2xDLGtGQUFrRjs0QkFDbEYsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQzs0QkFDL0MsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUN2RCxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZELE1BQU07d0JBQ1YsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7QUFDTCxDQUFDO0FBRUQscUVBQXFFO0FBQ3JFLHVEQUF1RDtBQUN2RCxrRkFBa0Y7QUFDbEYsZ0ZBQWdGO0FBQ2hGLHFGQUFxRjtBQUNyRixvRkFBb0Y7QUFDcEYsK0VBQStFO0FBQy9FLHNGQUFzRjtBQUN0RixzRkFBc0Y7QUFDdEYscUZBQXFGO0FBQ3JGLGtGQUFrRjtBQUNsRixzRkFBc0Y7QUFDdEYscUVBQXFFO0FBQ3JFLHFFQUFxRTtBQUVyRSxTQUFTLGlCQUFpQixDQUN0QixZQUFvQixFQUNwQixTQUFpQixFQUNqQixLQUFhLEVBQ2IsTUFBYyxFQUNkLElBQXlGO0lBRXpGLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN4QyxPQUFPO0lBQ1gsQ0FBQztJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUUzQixNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDckIsTUFBTSxLQUFLLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQztJQUNqQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsVUFBVSxDQUFDO0lBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxVQUFVLENBQUM7SUFDbEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztJQUNqQyxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO0lBRWpDLElBQUksTUFBTSxHQUFHLENBQUMsRUFDVixNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBRWYseUJBQXlCO0lBQ3pCLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNoQixNQUFNLEdBQUcsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUMvQixNQUFNLEdBQUcsV0FBVyxHQUFHLE9BQU8sR0FBRyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsRCxPQUFPLE1BQU0sSUFBSSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNoQyxZQUFZLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRCxDQUFDO0lBQ0wsQ0FBQztJQUNELDRCQUE0QjtJQUM1QixJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDL0IsTUFBTSxHQUFHLFdBQVcsR0FBRyxPQUFPLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEQsT0FBTyxNQUFNLElBQUksTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEMsWUFBWSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsQ0FBQztJQUNMLENBQUM7SUFDRCw2QkFBNkI7SUFDN0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sR0FBRyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQy9CLE1BQU0sR0FBRyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQy9CLE9BQU8sTUFBTSxJQUFJLE1BQU0sRUFBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdkMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0MsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pELFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqRCxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQztJQUNMLENBQUM7SUFDRCw4QkFBOEI7SUFDOUIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDO1FBQ25CLE1BQU0sR0FBRyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQy9CLE1BQU0sR0FBRyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQy9CLE9BQU8sTUFBTSxJQUFJLE1BQU0sRUFBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdkMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0MsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pELFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqRCxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQztJQUNMLENBQUM7SUFDRCxlQUFlO0lBQ2YsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2pDLEtBQUssTUFBTSxHQUFHLFdBQVcsR0FBRyxPQUFPLEVBQUUsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ2xGLFlBQVksQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRSxDQUFDO0lBQ0wsQ0FBQztJQUNELElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxLQUFLLE1BQU0sR0FBRyxXQUFXLEdBQUcsT0FBTyxFQUFFLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUNsRixZQUFZLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxVQUFVLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEUsQ0FBQztJQUNMLENBQUM7SUFDRCxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDckMsS0FBSyxNQUFNLEdBQUcsV0FBVyxHQUFHLE9BQU8sRUFBRSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDbEYsWUFBWSxDQUFDLE1BQU0sR0FBRyxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xFLENBQUM7SUFDTCxDQUFDO0lBQ0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBQ3hDLEtBQUssTUFBTSxHQUFHLFdBQVcsR0FBRyxPQUFPLEVBQUUsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ2xGLFlBQVksQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRSxDQUFDO0lBQ0wsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8vIHByZXZlbnRzIGVkZ2UgYXJ0aWZhY3RzIGR1ZSB0byBiaWxpbmVhciBmaWx0ZXJpbmdcclxuLy8vIE5vdGU6IFNvbWUgaW1hZ2UgZWRpdG9ycyBsaWtlIFBob3Rvc2hvcCB0ZW5kIHRvIGZpbGwgcHVyZWx5IHRyYW5zcGFyZW50IHBpeGVsIHdpdGhcclxuLy8vIHdoaXRlIGNvbG9yIChSPTEsIEc9MSwgQj0xLCBBPTApLiBUaGlzIGlzIGdlbmVyYWxseSBPSywgYmVjYXVzZSB0aGVzZSB3aGl0ZSBwaXhlbHNcclxuLy8vIGFyZSBpbXBvc3NpYmxlIHRvIHNlZSBpbiBub3JtYWwgY2lyY3Vtc3RhbmNlcy4gIEhvd2V2ZXIsIHdoZW4gc3VjaCB0ZXh0dXJlcyBhcmVcclxuLy8vIHVzZWQgaW4gM0Qgd2l0aCBiaWxpbmVhciBmaWx0ZXJpbmcsIHRoZSBzaGFkZXIgd2lsbCBzb21ldGltZXMgc2FtcGxlIGJleW9uZCB2aXNpYmxlXHJcbi8vLyBlZGdlcyBpbnRvIHB1cmVseSB0cmFuc3BhcmVudCBwaXhlbHMgYW5kIHRoZSB3aGl0ZSBjb2xvciBzdG9yZWQgdGhlcmUgd2lsbCBibGVlZFxyXG4vLy8gaW50byB0aGUgdmlzaWJsZSBlZGdlLiAgVGhpcyBtZXRob2Qgc2NhbnMgdGhlIHRleHR1cmUgdG8gZmluZCBhbGwgcHVyZWx5IHRyYW5zcGFyZW50XHJcbi8vLyBwaXhlbHMgdGhhdCBoYXZlIGEgdmlzaWJsZSBuZWlnaGJvciBwaXhlbCwgYW5kIGNvcHkgdGhlIGNvbG9yIGRhdGEgZnJvbSB0aGF0IG5laWdoYm9yXHJcbi8vLyBpbnRvIHRoZSB0cmFuc3BhcmVudCBwaXhlbCwgd2hpbGUgcHJlc2VydmluZyBpdHMgMCBhbHBoYSB2YWx1ZS4gIEluIG9yZGVyIHRvXHJcbi8vLyBvcHRpbWl6ZSB0aGUgYWxnb3JpdGhtIGZvciBzcGVlZCBvZiBleGVjdXRpb24sIGEgY29tcHJvbWlzZSBpcyBtYWRlIHRvIHVzZSBhbnlcclxuLy8vIGFyYml0cmFyeSBuZWlnaGJvcmluZyBwaXhlbCwgYXMgdGhpcyBzaG91bGQgZ2VuZXJhbGx5IGxlYWQgdG8gY29ycmVjdCByZXN1bHRzLlxyXG4vLy8gSXQgYWxzbyBsaW1pdHMgaXRzZWxmIHRvIHRoZSBpbW1lZGlhdGUgbmVpZ2hib3JzIGFyb3VuZCB0aGUgZWRnZSwgcmVzdWx0aW5nIGluIGFcclxuLy8vIGEgYmxlZWQgb2YgYSBzaW5nbGUgcGl4ZWwgYm9yZGVyIGFyb3VuZCB0aGUgZWRnZXMsIHdoaWNoIHNob3VsZCBiZSBmaW5lLCBhcyBiaWxpbmVhclxyXG4vLy8gZmlsdGVyaW5nIHNob3VsZCBnZW5lcmFsbHkgbm90IHNhbXBsZSBiZXlvbmQgdGhhdCBvbmUgcGl4ZWwgcmFuZ2UuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBYIGFuZCBZIG9mZnNldHMgdXNlZCBpbiBjb250b3VyIGJsZWVkIGZvciBzYW1wbGluZyBhbGwgYXJvdW5kIGVhY2ggcHVyZWx5IHRyYW5zcGFyZW50IHBpeGVsXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlDb250b3VyQmxlZWQoXHJcbiAgICByZXN1bHRCdWZmZXI6IEJ1ZmZlcixcclxuICAgIHNyY0J1ZmZlcjogQnVmZmVyLFxyXG4gICAgd2lkdGg6IG51bWJlcixcclxuICAgIHJlY3Q6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXI7IHg6IG51bWJlcjsgeE1heDogbnVtYmVyOyB5OiBudW1iZXI7IHlNYXg6IG51bWJlciB9LFxyXG4gICAgc2FtcGxlWE9mZnNldHM6IG51bWJlcltdLFxyXG4gICAgc2FtcGxlWU9mZnNldHM6IG51bWJlcltdLFxyXG4gICAgYnVmSWR4T2Zmc2V0czogbnVtYmVyW10sXHJcbikge1xyXG4gICAgaWYgKHJlY3Qud2lkdGggPT09IDAgfHwgcmVjdC5oZWlnaHQgPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3RhcnRfeCA9IHJlY3QueDtcclxuICAgIGNvbnN0IGVuZF94ID0gcmVjdC54TWF4O1xyXG4gICAgY29uc3Qgc3RhcnRfeSA9IHJlY3QueTtcclxuICAgIGNvbnN0IGVuZF95ID0gcmVjdC55TWF4O1xyXG5cclxuICAgIGNvbnN0IHBpeGVsQnl0ZXMgPSA0O1xyXG4gICAgY29uc3QgZGl0Y2ggPSB3aWR0aCAqIHBpeGVsQnl0ZXM7XHJcbiAgICBsZXQgb2Zmc2V0SW5kZXggPSAwO1xyXG4gICAgY29uc3Qgb2Zmc2V0Q291bnQgPSBzYW1wbGVYT2Zmc2V0cy5sZW5ndGg7XHJcblxyXG4gICAgbGV0IHNhbXBsZVggPSAwLFxyXG4gICAgICAgIHNhbXBsZVkgPSAwLFxyXG4gICAgICAgIHNhbXBsZUJ1ZklkeCA9IDA7XHJcbiAgICBsZXQgYnVmSWR4ID0gMDtcclxuICAgIGxldCBidWZSb3dTdGFydCA9IHN0YXJ0X3kgKiBkaXRjaCArIHN0YXJ0X3ggKiBwaXhlbEJ5dGVzO1xyXG4gICAgZm9yIChsZXQgeSA9IHN0YXJ0X3ksIHggPSAwOyB5IDwgZW5kX3k7ICsreSwgYnVmUm93U3RhcnQgKz0gZGl0Y2gpIHtcclxuICAgICAgICBidWZJZHggPSBidWZSb3dTdGFydDtcclxuICAgICAgICBmb3IgKHggPSBzdGFydF94OyB4IDwgZW5kX3g7ICsreCwgYnVmSWR4ICs9IHBpeGVsQnl0ZXMpIHtcclxuICAgICAgICAgICAgLy8gb25seSBuZWVkcyB0byBibGVlZCBpbnRvIHB1cmVseSB0cmFuc3BhcmVudCBwaXhlbHNcclxuICAgICAgICAgICAgaWYgKHNyY0J1ZmZlcltidWZJZHggKyAzXSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gc2FtcGxlIGFsbCBhcm91bmQgdG8gZmluZCBhbnkgbm9uLXB1cmVseSB0cmFuc3BhcmVudCBwaXhlbHNcclxuICAgICAgICAgICAgICAgIGZvciAob2Zmc2V0SW5kZXggPSAwOyBvZmZzZXRJbmRleCA8IG9mZnNldENvdW50OyBvZmZzZXRJbmRleCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlWCA9IHggKyBzYW1wbGVYT2Zmc2V0c1tvZmZzZXRJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlWSA9IHkgKyBzYW1wbGVZT2Zmc2V0c1tvZmZzZXRJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc3RheSB3aXRoaW4gdGV4dHVyZSBib3VuZHNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2FtcGxlWCA+PSBzdGFydF94ICYmIHNhbXBsZVggPCBlbmRfeCAmJiBzYW1wbGVZID49IHN0YXJ0X3kgJiYgc2FtcGxlWSA8IGVuZF95KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZUJ1ZklkeCA9IGJ1ZklkeCArIGJ1ZklkeE9mZnNldHNbb2Zmc2V0SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3JjQnVmZmVyW3NhbXBsZUJ1ZklkeCArIDNdID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29weSBSR0IgY29sb3IgY2hhbm5lbHMgdG8gcHVyZWx5IHRyYW5zcGFyZW50IHBpeGVsLCBidXQgcHJlc2VydmluZyBpdHMgMCBhbHBoYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0QnVmZmVyW2J1ZklkeF0gPSBzcmNCdWZmZXJbc2FtcGxlQnVmSWR4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEJ1ZmZlcltidWZJZHggKyAxXSA9IHNyY0J1ZmZlcltzYW1wbGVCdWZJZHggKyAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEJ1ZmZlcltidWZJZHggKyAyXSA9IHNyY0J1ZmZlcltzYW1wbGVCdWZJZHggKyAyXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8vIHByZXZlbnRzIGJvcmRlciBhcnRpZmFjdHMgZHVlIHRvIGJpbGluZWFyIGZpbHRlcmluZ1xyXG4vLy8gTm90ZTogU2hhZGVycyB3aXRoIGJpbGluZWFyIGZpbHRlcmluZyB3aWxsIHNvbWV0aW1lcyBzYW1wbGUgb3V0c2lkZSB0aGUgYm91bmRzXHJcbi8vLyBvZiB0aGUgZWxlbWVudCwgaW4gdGhlIHBhZGRpbmcgYXJlYSwgcmVzdWx0aW5nIGluIHRoZSBwYWRkaW5nIGNvbG9yIHRvIGJsZWVkXHJcbi8vLyBhcm91bmQgdGhlIHJlY3Rhbmd1bGFyIGJvcmRlcnMgb2YgdGhlIGVsZW1lbnQuICBUaGlzIGlzIHRydWUgZXZlbiB3aGVuIHBhZGRpbmcgaXNcclxuLy8vIHB1cmVseSB0cmFuc3BhcmVudCwgYmVjYXVzZSBpbiB0aGF0IGNhc2UsIGl0IGlzIHRoZSAwIGFscGhhIHRoYXQgYmxlZWRzIGludG8gdGhlXHJcbi8vLyBhbHBoYSBvZiB0aGUgb3V0ZXIgcGl4ZWxzLiAgU3VjaCBhbHBoYSBibGVlZCBpcyBlc3BlY2lhbGx5IHByb2JsZW1hdGljIHdoZW5cclxuLy8vIHRyeWluZyB0byBzZWFtbGVzc2x5IHRpbGUgbXVsdGlwbGUgcmVjdGFuZ3VsYXIgdGV4dHVyZXMsIGFzIHNlbWktdHJhbnNwYXJlbnQgc2VhbXNcclxuLy8vIHdpbGwgc29tZXRpbWVzIGFwcGVhciBhdCBkaWZmZXJlbnQgc2NhbGVzLiAgVGhpcyBtZXRob2QgZHVwbGljYXRlcyBhIHNpbmdsZSByb3cgb2ZcclxuLy8vIHBpeGVscyBmcm9tIHRoZSBpbm5lciBib3JkZXIgb2YgYW4gZWxlbWVudCBpbnRvIHRoZSBwYWRkaW5nIGFyZWEuICBUaGlzIHRlY2huaXF1ZVxyXG4vLy8gY2FuIGJlIHVzZWQgd2l0aCBhbGwga2luZHMgb2YgdGV4dHVyZXMgd2l0aG91dCByaXNrLCBldmVuIHRleHR1cmVzIHdpdGggdW5ldmVuXHJcbi8vLyB0cmFuc3BhcmVudCBlZGdlcywgYXMgaXQgb25seSBhbGxvd3MgdGhlIHNoYWRlciB0byBzYW1wbGUgbW9yZSBvZiB0aGUgc2FtZSAob3BhcXVlXHJcbi8vLyBvciB0cmFuc3BhcmVudCkgdmFsdWVzIHdoZW4gaXQgZXhjZWVkcyB0aGUgYm91bmRzIG9mIHRoZSBlbGVtZW50LlxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5UGFkZGluZ0JsZWVkKFxyXG4gICAgcmVzdWx0QnVmZmVyOiBCdWZmZXIsXHJcbiAgICBzcmNCdWZmZXI6IEJ1ZmZlcixcclxuICAgIHdpZHRoOiBudW1iZXIsXHJcbiAgICBoZWlnaHQ6IG51bWJlcixcclxuICAgIHJlY3Q6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXI7IHk6IG51bWJlcjsgeU1heDogbnVtYmVyOyB4OiBudW1iZXI7IHhNYXg6IG51bWJlciB9LFxyXG4pIHtcclxuICAgIGlmIChyZWN0LndpZHRoID09PSAwIHx8IHJlY3QuaGVpZ2h0ID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHlNaW4gPSByZWN0Lnk7XHJcbiAgICBjb25zdCB5TWF4ID0gcmVjdC55TWF4IC0gMTtcclxuICAgIGNvbnN0IHhNaW4gPSByZWN0Lng7XHJcbiAgICBjb25zdCB4TWF4ID0gcmVjdC54TWF4IC0gMTtcclxuXHJcbiAgICBjb25zdCBwaXhlbEJ5dGVzID0gNDtcclxuICAgIGNvbnN0IGRpdGNoID0gd2lkdGggKiBwaXhlbEJ5dGVzO1xyXG4gICAgY29uc3QgeEJ1Zk1pbiA9IHhNaW4gKiBwaXhlbEJ5dGVzO1xyXG4gICAgY29uc3QgeEJ1Zk1heCA9IHhNYXggKiBwaXhlbEJ5dGVzO1xyXG4gICAgY29uc3QgdG9wUm93U3RhcnQgPSB5TWluICogZGl0Y2g7XHJcbiAgICBjb25zdCBib3RSb3dTdGFydCA9IHlNYXggKiBkaXRjaDtcclxuXHJcbiAgICBsZXQgYnVmSWR4ID0gMCxcclxuICAgICAgICBidWZFbmQgPSAwO1xyXG5cclxuICAgIC8vIGNvcHkgdG9wIHJvdyBvZiBwaXhlbHNcclxuICAgIGlmICh5TWluIC0gMSA+PSAwKSB7XHJcbiAgICAgICAgYnVmSWR4ID0gdG9wUm93U3RhcnQgKyB4QnVmTWluO1xyXG4gICAgICAgIGJ1ZkVuZCA9IHRvcFJvd1N0YXJ0ICsgeEJ1Zk1heCArIChwaXhlbEJ5dGVzIC0gMSk7XHJcbiAgICAgICAgZm9yICg7IGJ1ZklkeCA8PSBidWZFbmQ7ICsrYnVmSWR4KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdEJ1ZmZlcltidWZJZHggLSBkaXRjaF0gPSBzcmNCdWZmZXJbYnVmSWR4XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjb3B5IGJvdHRvbSByb3cgb2YgcGl4ZWxzXHJcbiAgICBpZiAoeU1heCArIDEgPCBoZWlnaHQpIHtcclxuICAgICAgICBidWZJZHggPSBib3RSb3dTdGFydCArIHhCdWZNaW47XHJcbiAgICAgICAgYnVmRW5kID0gYm90Um93U3RhcnQgKyB4QnVmTWF4ICsgKHBpeGVsQnl0ZXMgLSAxKTtcclxuICAgICAgICBmb3IgKDsgYnVmSWR4IDw9IGJ1ZkVuZDsgKytidWZJZHgpIHtcclxuICAgICAgICAgICAgcmVzdWx0QnVmZmVyW2J1ZklkeCArIGRpdGNoXSA9IHNyY0J1ZmZlcltidWZJZHhdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGNvcHkgbGVmdCBjb2x1bW4gb2YgcGl4ZWxzXHJcbiAgICBpZiAoeE1pbiAtIDEgPj0gMCkge1xyXG4gICAgICAgIGJ1ZklkeCA9IHRvcFJvd1N0YXJ0ICsgeEJ1Zk1pbjtcclxuICAgICAgICBidWZFbmQgPSBib3RSb3dTdGFydCArIHhCdWZNaW47XHJcbiAgICAgICAgZm9yICg7IGJ1ZklkeCA8PSBidWZFbmQ7IGJ1ZklkeCArPSBkaXRjaCkge1xyXG4gICAgICAgICAgICByZXN1bHRCdWZmZXJbYnVmSWR4IC0gNF0gPSBzcmNCdWZmZXJbYnVmSWR4XTtcclxuICAgICAgICAgICAgcmVzdWx0QnVmZmVyW2J1ZklkeCAtIDNdID0gc3JjQnVmZmVyW2J1ZklkeCArIDFdO1xyXG4gICAgICAgICAgICByZXN1bHRCdWZmZXJbYnVmSWR4IC0gMl0gPSBzcmNCdWZmZXJbYnVmSWR4ICsgMl07XHJcbiAgICAgICAgICAgIHJlc3VsdEJ1ZmZlcltidWZJZHggLSAxXSA9IHNyY0J1ZmZlcltidWZJZHggKyAzXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjb3B5IHJpZ2h0IGNvbHVtbiBvZiBwaXhlbHNcclxuICAgIGlmICh4TWF4ICsgMSA8IHdpZHRoKSB7XHJcbiAgICAgICAgYnVmSWR4ID0gdG9wUm93U3RhcnQgKyB4QnVmTWF4O1xyXG4gICAgICAgIGJ1ZkVuZCA9IGJvdFJvd1N0YXJ0ICsgeEJ1Zk1heDtcclxuICAgICAgICBmb3IgKDsgYnVmSWR4IDw9IGJ1ZkVuZDsgYnVmSWR4ICs9IGRpdGNoKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdEJ1ZmZlcltidWZJZHggKyA0XSA9IHNyY0J1ZmZlcltidWZJZHhdO1xyXG4gICAgICAgICAgICByZXN1bHRCdWZmZXJbYnVmSWR4ICsgNV0gPSBzcmNCdWZmZXJbYnVmSWR4ICsgMV07XHJcbiAgICAgICAgICAgIHJlc3VsdEJ1ZmZlcltidWZJZHggKyA2XSA9IHNyY0J1ZmZlcltidWZJZHggKyAyXTtcclxuICAgICAgICAgICAgcmVzdWx0QnVmZmVyW2J1ZklkeCArIDddID0gc3JjQnVmZmVyW2J1ZklkeCArIDNdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGNvcHkgY29ybmVyc1xyXG4gICAgaWYgKHhNaW4gLSAxID49IDAgJiYgeU1pbiAtIDEgPj0gMCkge1xyXG4gICAgICAgIGZvciAoYnVmSWR4ID0gdG9wUm93U3RhcnQgKyB4QnVmTWluLCBidWZFbmQgPSBidWZJZHggKyA0OyBidWZJZHggPCBidWZFbmQ7IGJ1ZklkeCsrKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdEJ1ZmZlcltidWZJZHggLSBkaXRjaCAtIHBpeGVsQnl0ZXNdID0gc3JjQnVmZmVyW2J1ZklkeF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHhNYXggKyAxIDwgd2lkdGggJiYgeU1pbiAtIDEgPj0gMCkge1xyXG4gICAgICAgIGZvciAoYnVmSWR4ID0gdG9wUm93U3RhcnQgKyB4QnVmTWF4LCBidWZFbmQgPSBidWZJZHggKyA0OyBidWZJZHggPCBidWZFbmQ7IGJ1ZklkeCsrKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdEJ1ZmZlcltidWZJZHggLSBkaXRjaCArIHBpeGVsQnl0ZXNdID0gc3JjQnVmZmVyW2J1ZklkeF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHhNaW4gLSAxID49IDAgJiYgeU1heCArIDEgPCBoZWlnaHQpIHtcclxuICAgICAgICBmb3IgKGJ1ZklkeCA9IGJvdFJvd1N0YXJ0ICsgeEJ1Zk1pbiwgYnVmRW5kID0gYnVmSWR4ICsgNDsgYnVmSWR4IDwgYnVmRW5kOyBidWZJZHgrKykge1xyXG4gICAgICAgICAgICByZXN1bHRCdWZmZXJbYnVmSWR4ICsgZGl0Y2ggLSBwaXhlbEJ5dGVzXSA9IHNyY0J1ZmZlcltidWZJZHhdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh4TWF4ICsgMSA8IHdpZHRoICYmIHlNYXggKyAxIDwgaGVpZ2h0KSB7XHJcbiAgICAgICAgZm9yIChidWZJZHggPSBib3RSb3dTdGFydCArIHhCdWZNYXgsIGJ1ZkVuZCA9IGJ1ZklkeCArIDQ7IGJ1ZklkeCA8IGJ1ZkVuZDsgYnVmSWR4KyspIHtcclxuICAgICAgICAgICAgcmVzdWx0QnVmZmVyW2J1ZklkeCArIGRpdGNoICsgcGl4ZWxCeXRlc10gPSBzcmNCdWZmZXJbYnVmSWR4XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19