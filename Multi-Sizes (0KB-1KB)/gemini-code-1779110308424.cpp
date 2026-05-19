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
            PF_STRCPY(def.name, "Amount");
            def.u.sd.value_default = 100;
            def.u.sd.value_min = 0;
            def.u.sd.value_max = 100;
            def.u.sd.slider_min = 0;
            def.u.sd.slider_max = 100;
            def.uu.id = 1;
            (*in_data->utils->pf_add_param)(in_data->effect_ref, -1, &def);
            out_data->num_params = 2;
            break;
        case PF_Cmd_RENDER:
            PF_EffectWorld *input = &params[0]->u.ld;
            A_long amt = params[1]->u.sd.value;
            for (A_long y = output->extent_hint.top; y < output->extent_hint.bottom; ++y) {
                PF_Pixel *in_row = (PF_Pixel*)((char*)input->data + (y * input->rowbytes));
                PF_Pixel *out_row = (PF_Pixel*)((char*)output->data + (y * output->rowbytes));
                for (A_long x = output->extent_hint.left; x < output->extent_hint.right; ++x) {
                    PF_Pixel in_p = in_row[x];
                    PF_Pixel out_p;
                    A_long lum = (in_p.red * 299 + in_p.green * 587 + in_p.blue * 114) / 1000;
                    out_p.red = (A_u_char)(in_p.red + (lum - in_p.red) * amt / 100);
                    out_p.green = (A_u_char)(in_p.green + (lum - in_p.green) * amt / 100);
                    out_p.blue = (A_u_char)(in_p.blue + (lum - in_p.blue) * amt / 100);
                    out_p.alpha = in_p.alpha;
                    out_row[x] = out_p;
                }
            }
            break;
    }
    return err;
}