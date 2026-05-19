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
            PF_STRCPY(def.name, "Distance");
            def.u.sd.value_default = 10;
            def.u.sd.value_min = 0;
            def.u.sd.value_max = 50;
            def.u.sd.slider_min = 0;
            def.u.sd.slider_max = 50;
            def.uu.id = 1;
            (*in_data->utils->pf_add_param)(in_data->effect_ref, -1, &def);
            
            PF_ParamDef def2 = {};
            def2.param_type = PF_Param_SLIDER;
            PF_STRCPY(def2.name, "Opacity");
            def2.u.sd.value_default = 50;
            def2.u.sd.value_min = 0;
            def2.u.sd.value_max = 100;
            def2.u.sd.slider_min = 0;
            def2.u.sd.slider_max = 100;
            def2.uu.id = 2;
            (*in_data->utils->pf_add_param)(in_data->effect_ref, -1, &def2);
            
            out_data->num_params = 3;
            break;
        case PF_Cmd_RENDER:
            PF_EffectWorld *input = &params[0]->u.ld;
            A_long dist = params[1]->u.sd.value;
            A_long opacity = params[2]->u.sd.value;
            for (A_long y = output->extent_hint.top; y < output->extent_hint.bottom; ++y) {
                PF_Pixel *in_row = (PF_Pixel*)((char*)input->data + (y * input->rowbytes));
                PF_Pixel *out_row = (PF_Pixel*)((char*)output->data + (y * output->rowbytes));
                for (A_long x = output->extent_hint.left; x < output->extent_hint.right; ++x) {
                    PF_Pixel in_p = in_row[x];
                    A_u_char shadow_alpha = 0;
                    if ((x >= dist) && (y >= dist)) {
                        PF_Pixel *shadow_row = (PF_Pixel*)((char*)input->data + ((y - dist) * input->rowbytes));
                        shadow_alpha = shadow_row[x - dist].alpha;
                    }
                    A_long s_a = (shadow_alpha * opacity) / 100;
                    A_long out_a = in_p.alpha + (s_a * (255 - in_p.alpha)) / 255;
                    if (out_a > 255) out_a = 255;
                    PF_Pixel out_p;
                    out_p.alpha = (A_u_char)out_a;
                    out_p.red = (A_u_char)(in_p.red);
                    out_p.green = (A_u_char)(in_p.green);
                    out_p.blue = (A_u_char)(in_p.blue);
                    out_row[x] = out_p;
                }
            }
            break;
    }
    return err;
}