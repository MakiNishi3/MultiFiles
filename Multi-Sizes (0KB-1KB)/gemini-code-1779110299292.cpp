#include "AE_Effect.h"
#include "AE_EffectCB.h"
#include "AE_Macros.h"

extern "C" DllExport PF_Err EffectMain(PF_Cmd cmd, PF_InData *in_data, PF_OutData *out_data, PF_ParamDef *params[], PF_LayerDef *output, void *extra) {
    PF_Err err = PF_Err_NONE;
    switch (cmd) {
        case PF_Cmd_GLOBAL_SETUP:
            out_data->my_version = PF_VERSION(1,0,0,1,1);
            out_data->out_flags = PF_OutFlag_PIX_INDEPENDENT;
            break;
        case PF_Cmd_PARAMS_SETUP:
            PF_ParamDef def = {};
            def.param_type = PF_Param_SLIDER;
            PF_STRCPY(def.name, "Radius");
            def.u.sd.value_default = 5;
            def.u.sd.value_min = 0;
            def.u.sd.value_max = 20;
            def.u.sd.slider_min = 0;
            def.u.sd.slider_max = 20;
            def.uu.id = 1;
            (*in_data->utils->pf_add_param)(in_data->effect_ref, -1, &def);
            out_data->num_params = 2;
            break;
        case PF_Cmd_RENDER:
            PF_EffectWorld *input = &params[0]->u.ld;
            A_long r = params[1]->u.sd.value;
            if (r < 0) r = 0;
            if (r > 20) r = 20;
            A_long width = input->width;
            A_long height = input->height;
            for (A_long y = output->extent_hint.top; y < output->extent_hint.bottom; ++y) {
                PF_Pixel *out_row = (PF_Pixel*)((char*)output->data + (y * output->rowbytes));
                for (A_long x = output->extent_hint.left; x < output->extent_hint.right; ++x) {
                    A_long sum_r = 0, sum_g = 0, sum_b = 0, sum_a = 0, count = 0;
                    for (A_long ky = -r; ky <= r; ++ky) {
                        A_long py = y + ky;
                        if (py < 0) py = 0;
                        if (py >= height) py = height - 1;
                        PF_Pixel *in_row = (PF_Pixel*)((char*)input->data + (py * input->rowbytes));
                        for (A_long kx = -r; kx <= r; ++kx) {
                            A_long px = x + kx;
                            if (px < 0) px = 0;
                            if (px >= width) px = width - 1;
                            PF_Pixel p = in_row[px];
                            sum_r += p.red;
                            sum_g += p.green;
                            sum_b += p.blue;
                            sum_a += p.alpha;
                            count++;
                        }
                    }
                    PF_Pixel out_p;
                    out_p.red = (A_u_char)(sum_r / count);
                    out_p.green = (A_u_char)(sum_g / count);
                    out_p.blue = (A_u_char)(sum_b / count);
                    out_p.alpha = (A_u_char)(sum_a / count);
                    out_row[x] = out_p;
                }
            }
            break;
    }
    return err;
}