#include <stdint.h>
#include <cmath>
#include <cstdlib>

struct FilterRecord {
    int32_t imageMode;
    int16_t imageSizeY;
    int16_t imageSizeX;
    int16_t planes;
    void* inData;
    int32_t inRowBytes;
    void* outData;
    int32_t outRowBytes;
    float floatParams[16];
    int32_t effectType;
};

void applyColorCube(FilterRecord* pb) {
    uint8_t* inPtr = (uint8_t*)pb->inData;
    uint8_t* outPtr = (uint8_t*)pb->outData;
    float size = pb->floatParams[0];
    if (size < 1.0f) size = 1.0f;
    for (int y = 0; y < pb->imageSizeY; ++y) {
        for (int x = 0; x < pb->imageSizeX; ++x) {
            int idx = y * pb->inRowBytes + x * pb->planes;
            int oIdx = y * pb->outRowBytes + x * pb->planes;
            float r = inPtr[idx] / 255.0f;
            float g = inPtr[idx + 1] / 255.0f;
            float b = inPtr[idx + 2] / 255.0f;
            r = std::round(r * size) / size;
            g = std::round(g * size) / size;
            b = std::round(b * size) / size;
            outPtr[oIdx] = (uint8_t)(r * 255.0f);
            outPtr[oIdx + 1] = (uint8_t)(g * 255.0f);
            outPtr[oIdx + 2] = (uint8_t)(b * 255.0f);
            if (pb->planes == 4) {
                outPtr[oIdx + 3] = inPtr[idx + 3];
            }
        }
    }
}

void applyPerspective(FilterRecord* pb) {
    uint8_t* inPtr = (uint8_t*)pb->inData;
    uint8_t* outPtr = (uint8_t*)pb->outData;
    float warp = pb->floatParams[1];
    int cx = pb->imageSizeX / 2;
    int cy = pb->imageSizeY / 2;
    for (int y = 0; y < pb->imageSizeY; ++y) {
        for (int x = 0; x < pb->imageSizeX; ++x) {
            int oIdx = y * pb->outRowBytes + x * pb->planes;
            float nx = (float)(x - cx) / cx;
            float ny = (float)(y - cy) / cy;
            float perspectiveFactor = 1.0f + ny * warp;
            if (perspectiveFactor == 0.0f) perspectiveFactor = 0.001f;
            int srcX = cx + (int)(nx * cx / perspectiveFactor);
            int srcY = cy + (int)(ny * cy);
            if (srcX >= 0 && srcX < pb->imageSizeX && srcY >= 0 && srcY < pb->imageSizeY) {
                int iIdx = srcY * pb->inRowBytes + srcX * pb->planes;
                for (int p = 0; p < pb->planes; ++p) {
                    outPtr[oIdx + p] = inPtr[iIdx + p];
                }
            } else {
                for (int p = 0; p < pb->planes; ++p) {
                    outPtr[oIdx + p] = 0;
                }
            }
        }
    }
}

void applyWormhole(FilterRecord* pb) {
    uint8_t* inPtr = (uint8_t*)pb->inData;
    uint8_t* outPtr = (uint8_t*)pb->outData;
    float scale = pb->floatParams[2];
    int cx = pb->imageSizeX / 2;
    int cy = pb->imageSizeY / 2;
    for (int y = 0; y < pb->imageSizeY; ++y) {
        for (int x = 0; x < pb->imageSizeX; ++x) {
            int oIdx = y * pb->outRowBytes + x * pb->planes;
            float dx = (float)(x - cx);
            float dy = (float)(y - cy);
            float r = std::sqrt(dx * dx + dy * dy);
            float theta = std::atan2(dy, dx);
            if (r == 0.0f) r = 0.01f;
            float remapR = (scale * 100.0f) / r;
            int srcX = cx + (int)(remapR * std::cos(theta));
            int srcY = cy + (int)(remapR * std::sin(theta));
            srcX = (srcX % pb->imageSizeX + pb->imageSizeX) % pb->imageSizeX;
            srcY = (srcY % pb->imageSizeY + pb->imageSizeY) % pb->imageSizeY;
            int iIdx = srcY * pb->inRowBytes + srcX * pb->planes;
            for (int p = 0; p < pb->planes; ++p) {
                outPtr[oIdx + p] = inPtr[iIdx + p];
            }
        }
    }
}

void apply3DObject(FilterRecord* pb) {
    uint8_t* inPtr = (uint8_t*)pb->inData;
    uint8_t* outPtr = (uint8_t*)pb->outData;
    float rot = pb->floatParams[3];
    int cx = pb->imageSizeX / 2;
    int cy = pb->imageSizeY / 2;
    for (int y = 0; y < pb->imageSizeY; ++y) {
        for (int x = 0; x < pb->imageSizeX; ++x) {
            int iIdx = y * pb->inRowBytes + x * pb->planes;
            int oIdx = y * pb->outRowBytes + x * pb->planes;
            for (int p = 0; p < pb->planes; ++p) {
                outPtr[oIdx + p] = inPtr[iIdx + p];
            }
        }
    }
    float vertices[8][3] = {
        {-40.0f, -40.0f, -40.0f}, {40.0f, -40.0f, -40.0f}, {40.0f, 40.0f, -40.0f}, {-40.0f, 40.0f, -40.0f},
        {-40.0f, -40.0f, 40.0f},  {40.0f, -40.0f, 40.0f},  {40.0f, 40.0f, 40.0f},  {-40.0f, 40.0f, 40.0f}
    };
    int edges[12][2] = {
        {0,1}, {1,2}, {2,3}, {3,0},
        {4,5}, {5,6}, {6,7}, {7,4},
        {0,4}, {1,5}, {2,6}, {3,7}
    };
    float cosA = std::cos(rot);
    float sinA = std::sin(rot);
    int projX[8], projY[8];
    for (int i = 0; i < 8; ++i) {
        float x1 = vertices[i][0] * cosA - vertices[i][2] * sinA;
        float z1 = vertices[i][0] * sinA + vertices[i][2] * cosA;
        float y1 = vertices[i][1];
        float dist = 200.0f;
        projX[i] = cx + (int)(x1 * dist / (z1 + dist));
        projY[i] = cy + (int)(y1 * dist / (z1 + dist));
    }
    for (int i = 0; i < 12; ++i) {
        int x0 = projX[edges[i][0]];
        int y0 = projY[edges[i][0]];
        int x1 = projX[edges[i][1]];
        int y1 = projY[edges[i][1]];
        int dx = std::abs(x1 - x0);
        int sx = x0 < x1 ? 1 : -1;
        int dy = -std::abs(y1 - y0);
        int sy = y0 < y1 ? 1 : -1;
        int err = dx + dy;
        int e2 = 0;
        while (true) {
            if (x0 >= 0 && x0 < pb->imageSizeX && y0 >= 0 && y0 < pb->imageSizeY) {
                int idx = y0 * pb->outRowBytes + x0 * pb->planes;
                outPtr[idx] = 255;
                outPtr[idx + 1] = 255;
                outPtr[idx + 2] = 255;
            }
            if (x0 == x1 && y0 == y1) break;
            e2 = 2 * err;
            if (e2 >= dy) { err += dy; x0 += sx; }
            if (e2 <= dx) { err += dx; y0 += sy; }
        }
    }
}

void applyVortex(FilterRecord* pb) {
    uint8_t* inPtr = (uint8_t*)pb->inData;
    uint8_t* outPtr = (uint8_t*)pb->outData;
    float twist = pb->floatParams[4];
    int cx = pb->imageSizeX / 2;
    int cy = pb->imageSizeY / 2;
    float maxR = std::sqrt((float)(cx * cx + cy * cy));
    for (int y = 0; y < pb->imageSizeY; ++y) {
        for (int x = 0; x < pb->imageSizeX; ++x) {
            int oIdx = y * pb->outRowBytes + x * pb->planes;
            float dx = (float)(x - cx);
            float dy = (float)(y - cy);
            float r = std::sqrt(dx * dx + dy * dy);
            if (r < maxR) {
                float angle = std::atan2(dy, dx) + twist * (1.0f - r / maxR);
                int srcX = cx + (int)(r * std::cos(angle));
                int srcY = cy + (int)(r * std::sin(angle));
                if (srcX >= 0 && srcX < pb->imageSizeX && srcY >= 0 && srcY < pb->imageSizeY) {
                    int iIdx = srcY * pb->inRowBytes + srcX * pb->planes;
                    for (int p = 0; p < pb->planes; ++p) {
                        outPtr[oIdx + p] = inPtr[iIdx + p];
                    }
                    continue;
                }
            }
            int iIdx = y * pb->inRowBytes + x * pb->planes;
            for (int p = 0; p < pb->planes; ++p) {
                outPtr[oIdx + p] = inPtr[iIdx + p];
            }
        }
    }
}

extern "C" __declspec(dllexport) void PluginMain(const int16_t selector, FilterRecord* pb, int32_t* data, int16_t* result) {
    if (selector == 0) {
        *result = 0;
        return;
    }
    if (selector == 1) {
        if (pb->effectType == 0) applyColorCube(pb);
        else if (pb->effectType == 1) applyPerspective(pb);
        else if (pb->effectType == 2) applyWormhole(pb);
        else if (pb->effectType == 3) apply3DObject(pb);
        else if (pb->effectType == 4) applyVortex(pb);
        *result = 0;
        return;
    }
    *result = 0;
}