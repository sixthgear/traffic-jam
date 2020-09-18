// interface for setting each "stripe" in the road

interface RoadStripe {
    ground: number,
    surface: number, 
    sides: number, 
    lines: number,
}

// Custom palette
const Racing = color.hexArrayToPalette([
    0x000000, // 0x0 transparent
    0xFFFFFF, // 0x1 white
    0xFF2121, // 0x2 red
    0xFF93C4, // 0x3 
    0xFF8135, // 0x4
    0x68bf48, // 0x5 *dark green (was yellow FFF609)
    0x249CA3, // 0x6 cyan
    0x78DC52, // 0x7 green
    0x003FAD, // 0x8
    0x87F2FF, // 0x9
    0x8E2EC4, // 0xA 10
    0x595e69, // 0xB *dark grey (was A4839F)
    0x606774, // 0xC *grey (was 5C406c)
    0xE5CDC4, // 0xD beige
    0x91463d, // 0xE brown
    0x000000, // 0xF black
]);

color.setPalette(Racing);

const GameColors = {
    Ground: 0x7,
    Stripes: [
        {ground: 0x5, surface: 0XB, sides: 0xE, lines: 0x1}, // dark
        {ground: 0x7, surface: 0XC, sides: 0xD, lines: 0xC}, // light
    ]
}
