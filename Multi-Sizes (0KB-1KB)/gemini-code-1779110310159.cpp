#include "AE_Effect.h"
#include "AE_EffectCB.h"
#include "AE_Macros.h"
#include <math.h>

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
            PF_STRCPY(def.name, "Angle");
            def.u.sd.value_default = 0;
            def.u.sd.value_min = 0;
            def.u.sd.value_max = 360;
            def.u.sd.slider_min = 0;
            def.u.sd.slider_max = 360;
            def.uu.id = 1;
            (*in_data->utils->pf_add_param)(in_data->effect_ref, -1, &def);
            out_data->num_params = 2;
            break;
        case PF_Cmd_RENDER:
            PF_EffectWorld *input = &params[0]->u.ld;
            double angle = params[1]->u.sd.value;
            double rot = angle * 3.141592653589793 / 180.0;
            double cosV = cos(rot);
            double sinV = sin(rot);
            for (A_long y = output->extent_hint.top; y < output->extent_hint.bottom; ++y) {
                PF_Pixel *in_row = (PF_Pixel*)((char*)input->data + (y * input->rowbytes));
                PF_Pixel *out_row = (PF_Pixel*)((char*)output->data + (y * output->rowbytes));
                for (A_long x = output->extent_hint.left; x < output->extent_hint.right; ++x) {
                    PF_Pixel in_p = in_row[x];
                    PF_Pixel out_p;
                    double r = (.213 + .787 * cosV - .213 * sinV) * in_p.red + (.715 - .715 * cosV - .715 * sinV) * in_p.green + (.072 - .072 * cosV + .928 * sinV) * in_p.blue;
                    double g = (.213 - .213 * cosV + .143 * sinV) * in_p.red + (.715 + .285 * cosV + .140 * sinV) * in_p.green + (.072 - .072 * cosV - .283 * sinV) * in_p.blue;
                    double b = (.213 - .213 * cosV - .787 * sinV) * in_p.red + (.715 - .715 * cosV + .715 * sinV) * in_p.green + (.072 + .928 * cosV + .072 * sinV) * in_p.blue;
                    if (r < 0.0) r = 0.0; if (r > 255.0) r = 255.0;
                    if (g < 0.0) g = 0.0; if (g > 255.0) g = 255.0;
                    if (b < 0.0) b = 0.0; if (b > 255.0) b = 255.0;
                    out_p.red = (A_u_char)r;
                    out_p.green = (A_u_char)g;
                    out_p.blue = (A_u_char)b;
                    out_p.alpha = in_p.alpha;
                    out_row[x] = out_p;
                }
            }
            break;
    }
    return err;
}