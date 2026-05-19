#include <cmath>
#include <vector>
#include <algorithm>

struct RGBA {
    float r;
    float g;
    float b;
    float a;
};

struct Image {
    int width;
    int height;
    std::vector<RGBA> pixels;
};

struct Light {
    float x;
    float y;
    float z;
    float r;
    float g;
    float b;
    float directionX;
    float directionY;
    float directionZ;
    float coneAngle;
    float falloff;
};

struct TransferFunc {
    int type;
    float slope;
    float intercept;
    float amplitude;
    float exponent;
    float offset;
};

void Flood(const Image& src, Image& dst, RGBA color) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.assign(src.width * src.height, color);
}

void Offset(const Image& src, Image& dst, int dx, int dy) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            int sx = (x - dx) % src.width;
            int sy = (y - dy) % src.height;
            if (sx < 0) sx += src.width;
            if (sy < 0) sy += src.height;
            dst.pixels[y * src.width + x] = src.pixels[sy * src.width + sx];
        }
    }
}

void Tile(const Image& src, Image& dst, int width, int height) {
    dst.width = width;
    dst.height = height;
    dst.pixels.resize(width * height);
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int sx = x % src.width;
            int sy = y % src.height;
            dst.pixels[y * width + x] = src.pixels[sy * src.width + sx];
        }
    }
}

void ColorMatrix(const Image& src, Image& dst, const float m[20]) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (size_t i = 0; i < src.pixels.size(); ++i) {
        const auto& p = src.pixels[i];
        dst.pixels[i].r = std::max(0.0f, std::min(1.0f, p.r * m[0] + p.g * m[1] + p.b * m[2] + p.a * m[3] + m[4]));
        dst.pixels[i].g = std::max(0.0f, std::min(1.0f, p.r * m[5] + p.g * m[6] + p.b * m[7] + p.a * m[8] + m[9]));
        dst.pixels[i].b = std::max(0.0f, std::min(1.0f, p.r * m[10] + p.g * m[11] + p.b * m[12] + p.a * m[13] + m[14]));
        dst.pixels[i].a = std::max(0.0f, std::min(1.0f, p.r * m[15] + p.g * m[16] + p.b * m[17] + p.a * m[18] + m[19]));
    }
}

void Blend(const Image& src, const Image& bg, Image& dst, int mode) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (size_t i = 0; i < src.pixels.size(); ++i) {
        const auto& s = src.pixels[i];
        const auto& b = bg.pixels[i];
        RGBA r = s;
        if (mode == 0) {
            r.r = s.r * b.r;
            r.g = s.g * b.g;
            r.b = s.b * b.b;
        } else if (mode == 1) {
            r.r = 1.0f - (1.0f - s.r) * (1.0f - b.r);
            r.g = 1.0f - (1.0f - s.g) * (1.0f - b.g);
            r.b = 1.0f - (1.0f - s.b) * (1.0f - b.b);
        }
        dst.pixels[i] = r;
    }
}

void Composite(const Image& src, const Image& bg, Image& dst, int operatorType) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (size_t i = 0; i < src.pixels.size(); ++i) {
        const auto& s = src.pixels[i];
        const auto& b = bg.pixels[i];
        RGBA out = {0.0f, 0.0f, 0.0f, 0.0f};
        if (operatorType == 0) {
            float alpha = s.a + b.a * (1.0f - s.a);
            if (alpha > 0.0f) {
                out.r = (s.r * s.a + b.r * b.a * (1.0f - s.a)) / alpha;
                out.g = (s.g * s.a + b.g * b.a * (1.0f - s.a)) / alpha;
                out.b = (s.b * s.a + b.b * b.a * (1.0f - s.a)) / alpha;
                out.a = alpha;
            }
        }
        dst.pixels[i] = out;
    }
}

float ApplyFunc(float val, const TransferFunc& f) {
    if (f.type == 0) {
        return val;
    }
    if (f.type == 1) {
        return std::max(0.0f, std::min(1.0f, val * f.slope + f.intercept));
    }
    if (f.type == 2) {
        return std::max(0.0f, std::min(1.0f, f.amplitude * std::pow(std::max(0.0f, val), f.exponent) + f.offset));
    }
    return val;
}

void ComponentTransfer(const Image& src, Image& dst, TransferFunc r, TransferFunc g, TransferFunc b, TransferFunc a) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (size_t i = 0; i < src.pixels.size(); ++i) {
        dst.pixels[i].r = ApplyFunc(src.pixels[i].r, r);
        dst.pixels[i].g = ApplyFunc(src.pixels[i].g, g);
        dst.pixels[i].b = ApplyFunc(src.pixels[i].b, b);
        dst.pixels[i].a = ApplyFunc(src.pixels[i].a, a);
    }
}

void FuncR(const Image& src, Image& dst, TransferFunc f) {
    TransferFunc identity = {0, 1.0f, 0.0f, 1.0f, 1.0f, 0.0f};
    ComponentTransfer(src, dst, f, identity, identity, identity);
}

void FuncG(const Image& src, Image& dst, TransferFunc f) {
    TransferFunc identity = {0, 1.0f, 0.0f, 1.0f, 1.0f, 0.0f};
    ComponentTransfer(src, dst, identity, f, identity, identity);
}

void FuncB(const Image& src, Image& dst, TransferFunc f) {
    TransferFunc identity = {0, 1.0f, 0.0f, 1.0f, 1.0f, 0.0f};
    ComponentTransfer(src, dst, identity, identity, f, identity);
}

void FuncA(const Image& src, Image& dst, TransferFunc f) {
    TransferFunc identity = {0, 1.0f, 0.0f, 1.0f, 1.0f, 0.0f};
    ComponentTransfer(src, dst, identity, identity, identity, f);
}

void ConvolveMatrix(const Image& src, Image& dst, const std::vector<float>& kernel, int kWidth, int kHeight, float divisor, float bias) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    int kCenterX = kWidth / 2;
    int kCenterY = kHeight / 2;
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            float r = 0.0f, g = 0.0f, b = 0.0f, a = 0.0f;
            for (int ky = 0; ky < kHeight; ++ky) {
                for (int kx = 0; kx < kWidth; ++kx) {
                    int px = std::max(0, std::min(src.width - 1, x + kx - kCenterX));
                    int py = std::max(0, std::min(src.height - 1, y + ky - kCenterY));
                    float kVal = kernel[ky * kWidth + kx];
                    const auto& p = src.pixels[py * src.width + px];
                    r += p.r * kVal;
                    g += p.g * kVal;
                    b += p.b * kVal;
                    a += p.a * kVal;
                }
            }
            int idx = y * src.width + x;
            dst.pixels[idx].r = std::max(0.0f, std::min(1.0f, r / divisor + bias));
            dst.pixels[idx].g = std::max(0.0f, std::min(1.0f, g / divisor + bias));
            dst.pixels[idx].b = std::max(0.0f, std::min(1.0f, b / divisor + bias));
            dst.pixels[idx].a = std::max(0.0f, std::min(1.0f, a / divisor + bias));
        }
    }
}

void Morphology(const Image& src, Image& dst, int radius, int type) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            RGBA res = src.pixels[y * src.width + x];
            for (int dy = -radius; dy <= radius; ++dy) {
                for (int dx = -radius; dx <= radius; ++dx) {
                    int px = std::max(0, std::min(src.width - 1, x + dx));
                    int py = std::max(0, std::min(src.height - 1, y + dy));
                    const auto& p = src.pixels[py * src.width + px];
                    if (type == 0) {
                        res.r = std::min(res.r, p.r);
                        res.g = std::min(res.g, p.g);
                        res.b = std::min(res.b, p.b);
                        res.a = std::min(res.a, p.a);
                    } else {
                        res.r = std::max(res.r, p.r);
                        res.g = std::max(res.g, p.g);
                        res.b = std::max(res.b, p.b);
                        res.a = std::max(res.a, p.a);
                    }
                }
            }
            dst.pixels[y * src.width + x] = res;
        }
    }
}

void GaussianBlur(const Image& src, Image& dst, float radius) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    int r = static_cast<int>(std::ceil(radius * 3.0f));
    if (r < 1) {
        dst.pixels = src.pixels;
        return;
    }
    std::vector<float> kernel(2 * r + 1);
    float sum = 0.0f;
    for (int i = -r; i <= r; ++i) {
        kernel[i + r] = std::exp(-(i * i) / (2.0f * radius * radius));
        sum += kernel[i + r];
    }
    for (float& k : kernel) {
        k /= sum;
    }
    Image tmp = src;
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            float rs = 0.0f, gs = 0.0f, bs = 0.0f, as = 0.0f;
            for (int i = -r; i <= r; ++i) {
                int px = std::max(0, std::min(src.width - 1, x + i));
                const auto& p = src.pixels[y * src.width + px];
                float w = kernel[i + r];
                rs += p.r * w;
                gs += p.g * w;
                bs += p.b * w;
                as += p.a * w;
            }
            tmp.pixels[y * src.width + x] = {rs, gs, bs, as};
        }
    }
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            float rs = 0.0f, gs = 0.0f, bs = 0.0f, as = 0.0f;
            for (int i = -r; i <= r; ++i) {
                int py = std::max(0, std::min(src.height - 1, y + i));
                const auto& p = tmp.pixels[py * src.width + x];
                float w = kernel[i + r];
                rs += p.r * w;
                gs += p.g * w;
                bs += p.b * w;
                as += p.a * w;
            }
            dst.pixels[y * src.width + x] = {rs, gs, bs, as};
        }
    }
}

void DisplacementMap(const Image& src, const Image& map, Image& dst, float scaleX, float scaleY, int xChannel, int yChannel) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            const auto& mp = map.pixels[y * src.width + x];
            float cx = (xChannel == 0 ? mp.r : (xChannel == 1 ? mp.g : (xChannel == 2 ? mp.b : mp.a))) - 0.5f;
            float cy = (yChannel == 0 ? mp.r : (yChannel == 1 ? mp.g : (yChannel == 2 ? mp.b : mp.a))) - 0.5f;
            int sx = std::max(0, std::min(src.width - 1, static_cast<int>(x + cx * scaleX)));
            int sy = std::max(0, std::min(src.height - 1, static_cast<int>(y + cy * scaleY)));
            dst.pixels[y * src.width + x] = src.pixels[sy * src.width + sx];
        }
    }
}

void DropShadow(const Image& src, Image& dst, float dx, float dy, float radius, RGBA shadowColor) {
    Image offsetImg = src;
    offsetImg.pixels.assign(src.width * src.height, RGBA{0.0f, 0.0f, 0.0f, 0.0f});
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            int sx = static_cast<int>(x - dx);
            int sy = static_cast<int>(y - dy);
            if (sx >= 0 && sx < src.width && sy >= 0 && sy < src.height) {
                float alpha = src.pixels[sy * src.width + sx].a;
                offsetImg.pixels[y * src.width + x] = {shadowColor.r, shadowColor.g, shadowColor.b, alpha * shadowColor.a};
            }
        }
    }
    Image blurredShadow;
    GaussianBlur(offsetImg, blurredShadow, radius);
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (size_t i = 0; i < src.pixels.size(); ++i) {
        const auto& s = src.pixels[i];
        const auto& b = blurredShadow.pixels[i];
        float alpha = s.a + b.a * (1.0f - s.a);
        if (alpha > 0.0f) {
            dst.pixels[i].r = (s.r * s.a + b.r * b.a * (1.0f - s.a)) / alpha;
            dst.pixels[i].g = (s.g * s.a + b.g * b.a * (1.0f - s.a)) / alpha;
            dst.pixels[i].b = (s.b * s.a + b.b * b.a * (1.0f - s.a)) / alpha;
            dst.pixels[i].a = alpha;
        } else {
            dst.pixels[i] = {0.0f, 0.0f, 0.0f, 0.0f};
        }
    }
}

void CalculateNormal(const Image& src, int x, int y, float surfaceScale, float& nx, float& ny, float& nz) {
    int x1 = std::max(0, x - 1);
    int x2 = std::min(src.width - 1, x + 1);
    int y1 = std::max(0, y - 1);
    int y2 = std::min(src.height - 1, y + 1);
    float hL = src.pixels[y * src.width + x1].a * surfaceScale;
    float hR = src.pixels[y * src.width + x2].a * surfaceScale;
    float hT = src.pixels[y1 * src.width + x].a * surfaceScale;
    float hB = src.pixels[y2 * src.width + x].a * surfaceScale;
    nx = hL - hR;
    ny = hT - hB;
    nz = 1.0f;
    float len = std::sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 0.0f) {
        nx /= len;
        ny /= len;
        nz /= len;
    }
}

void GetLightVector(const Light& light, float x, float y, float z, float& lx, float& ly, float& lz, float& att) {
    att = 1.0f;
    if (light.coneAngle == 0.0f && light.directionZ != 0.0f) {
        lx = -light.directionX;
        ly = -light.directionY;
        lz = -light.directionZ;
        float len = std::sqrt(lx * lx + ly * ly + lz * lz);
        if (len > 0.0f) {
            lx /= len;
            ly /= len;
            lz /= len;
        }
    } else {
        lx = light.x - x;
        ly = light.y - y;
        lz = light.z - z;
        float dist = std::sqrt(lx * lx + ly * ly + lz * lz);
        if (dist > 0.0f) {
            lx /= dist;
            ly /= dist;
            lz /= dist;
        }
        if (light.coneAngle > 0.0f) {
            float dx = light.directionX;
            float dy = light.directionY;
            float dz = light.directionZ;
            float dlen = std::sqrt(dx * dx + dy * dy + dz * dz);
            if (dlen > 0.0f) {
                dx /= dlen;
                dy /= dlen;
                dz /= dlen;
            }
            float dotProduct = -(lx * dx + ly * dy + lz * dz);
            float cosCone = std::cos(light.coneAngle);
            if (dotProduct < cosCone) {
                att = 0.0f;
            } else {
                att = std::pow(dotProduct, light.falloff);
            }
        }
    }
}

void DistantLight(Light& l, float dx, float dy, float dz, float r, float g, float b) {
    l.directionX = dx;
    l.directionY = dy;
    l.directionZ = dz;
    l.r = r;
    l.g = g;
    l.b = b;
    l.coneAngle = 0.0f;
}

void PointLight(Light& l, float x, float y, float z, float r, float g, float b) {
    l.x = x;
    l.y = y;
    l.z = z;
    l.r = r;
    l.g = g;
    l.b = b;
    l.coneAngle = 0.0f;
    l.directionZ = 0.0f;
}

void Spotlight(Light& l, float x, float y, float z, float dx, float dy, float dz, float coneAngle, float falloff, float r, float g, float b) {
    l.x = x;
    l.y = y;
    l.z = z;
    l.directionX = dx;
    l.directionY = dy;
    l.directionZ = dz;
    l.coneAngle = coneAngle;
    l.falloff = falloff;
    l.r = r;
    l.g = g;
    l.b = b;
}

void DiffuseLighting(const Image& src, Image& dst, float surfaceScale, float diffuseConstant, const Light& light) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            float nx, ny, nz;
            CalculateNormal(src, x, y, surfaceScale, nx, ny, nz);
            float z = src.pixels[y * src.width + x].a * surfaceScale;
            float lx, ly, lz, att;
            GetLightVector(light, static_cast<float>(x), static_cast<float>(y), z, lx, ly, lz, att);
            float dot = std::max(0.0f, nx * lx + ny * ly + nz * lz);
            float factor = diffuseConstant * dot * att;
            dst.pixels[y * src.width + x].r = std::max(0.0f, std::min(1.0f, factor * light.r));
            dst.pixels[y * src.width + x].g = std::max(0.0f, std::min(1.0f, factor * light.g));
            dst.pixels[y * src.width + x].b = std::max(0.0f, std::min(1.0f, factor * light.b));
            dst.pixels[y * src.width + x].a = 1.0f;
        }
    }
}

void SpecularLighting(const Image& src, Image& dst, float surfaceScale, float specularConstant, float specularExponent, const Light& light) {
    dst.width = src.width;
    dst.height = src.height;
    dst.pixels.resize(src.width * src.height);
    for (int y = 0; y < src.height; ++y) {
        for (int x = 0; x < src.width; ++x) {
            float nx, ny, nz;
            CalculateNormal(src, x, y, surfaceScale, nx, ny, nz);
            float z = src.pixels[y * src.width + x].a * surfaceScale;
            float lx, ly, lz, att;
            GetLightVector(light, static_cast<float>(x), static_cast<float>(y), z, lx, ly, lz, att);
            float nx_lx = nx * lx + ny * ly + nz * lz;
            float rx = 2.0f * nx_lx * nx - lx;
            float ry = 2.0f * nx_lx * ny - ly;
            float rz = 2.0f * nx_lx * nz - lz;
            float dot = std::max(0.0f, rz);
            float factor = specularConstant * std::pow(dot, specularExponent) * att;
            dst.pixels[y * src.width + x].r = std::max(0.0f, std::min(1.0f, factor * light.r));
            dst.pixels[y * src.width + x].g = std::max(0.0f, std::min(1.0f, factor * light.g));
            dst.pixels[y * src.width + x].b = std::max(0.0f, std::min(1.0f, factor * light.b));
            dst.pixels[y * src.width + x].a = std::max(dst.pixels[y * src.width + x].r, std::max(dst.pixels[y * src.width + x].g, dst.pixels[y * src.width + x].b));
        }
    }
}

float Noise2D(float x, float y) {
    float dot = x * 12.9898f + y * 78.233f;
    float sn = std::fmod(dot, 3.14159265f);
    return std::abs(std::fmod(std::sin(sn) * 43758.5453f, 1.0f));
}

float SmoothNoise2D(float x, float y) {
    int ix = static_cast<int>(std::floor(x));
    int iy = static_cast<int>(std::floor(y));
    float fx = x - ix;
    float fy = y - iy;
    float v1 = Noise2D(static_cast<float>(ix), static_cast<float>(iy));
    float v2 = Noise2D(static_cast<float>(ix + 1), static_cast<float>(iy));
    float v3 = Noise2D(static_cast<float>(ix), static_cast<float>(iy + 1));
    float v4 = Noise2D(static_cast<float>(ix + 1), static_cast<float>(iy + 1));
    float t1 = fx * fx * (3.0f - 2.0f * fx);
    float t2 = fy * fy * (3.0f - 2.0f * fy);
    float m1 = v1 * (1.0f - t1) + v2 * t1;
    float m2 = v3 * (1.0f - t1) + v4 * t1;
    return m1 * (1.0f - t2) + m2 * t2;
}

void Turbulence(Image& dst, int width, int height, float baseFreqX, float baseFreqY, int numOctaves, int type) {
    dst.width = width;
    dst.height = height;
    dst.pixels.resize(width * height);
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            float val = 0.0f;
            float amp = 1.0f;
            float fx = x * baseFreqX;
            float fy = y * baseFreqY;
            float totalAmp = 0.0f;
            for (int o = 0; o < numOctaves; ++o) {
                float n = SmoothNoise2D(fx, fy);
                if (type == 1) {
                    n = std::abs(n * 2.0f - 1.0f);
                }
                val += n * amp;
                totalAmp += amp;
                amp *= 0.5f;
                fx *= 2.0f;
                fy *= 2.0f;
            }
            val /= totalAmp;
            dst.pixels[y * width + x] = {val, val, val, 1.0f};
        }
    }
}