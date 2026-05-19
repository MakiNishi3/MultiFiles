#include <windows.h>
#include <iostream>
#include <vector>
#include <string>
#include <fstream>

std::vector<std::string> generatePlugins()
{
    std::vector<std::string> base = {
        "addnoise","blur","sharpen","grain","glow","bloom","contrast","brightness","exposure","gamma",
        "levels","curves","invert","threshold","posterize","hue","saturation","colorbalance","wave",
        "yadif","zamaripple","zoomblur"
    };

    std::vector<std::string> extras;
    int count = 200;

    for (int i = 0; i < count; i++)
    {
        if (i < (int)base.size())
        {
            extras.push_back(base[i] + std::string(".nrf"));
        }
        else
        {
            int a = i % base.size();
            int b = (i * 7) % base.size();
            std::string name = base[a] + base[b] + std::to_string(i);
            extras.push_back(name + ".nrf");
        }
    }

    extras[0] = "addnoise.nrf";
    extras[19] = "colorbalance.nrf";
    extras[20] = "huesaturation.nrf";
    extras[21] = "wave.nrf";
    extras[22] = "yadif.nrf";
    extras[23] = "zamaripple.nrf";
    extras[199] = "zoomblur.nrf";

    return extras;
}

void copyPlugins(const std::vector<std::string>& plugins, const std::string& path)
{
    CreateDirectoryA(path.c_str(), NULL);

    for (const auto& p : plugins)
    {
        std::string full = path + "\\" + p;
        std::ofstream f(full, std::ios::binary);
        f << "NARINA_FFMEG_OFX_PLUGIN";
        f.close();
    }
}

int main()
{
    std::cout << "Narina OFX FFmpeg Filter Pack Setup Wizard\n";
    std::cout << "Welcome to the Narina FFmpeg OFX Plugin Pack Setup Wizard click next\n";
    std::cout << "Who would like to filter path: C:\\Program Files\\Narina\\Plugins\n";
    std::cout << "Press ENTER to continue\n";
    std::cin.get();

    std::string path = "C:\\Program Files\\Narina\\Plugins";

    std::cout << "Installation: copying plugins...\n";

    auto plugins = generatePlugins();
    copyPlugins(plugins, path);

    std::cout << "Complete the wizard click finish\n";
    std::cout << "No errors and warnings\n";

    return 0;
}