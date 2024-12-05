export const presetStore = (set, get) => ({
  presets: [
    {
      name: "Print",
      items: [
        {
          name: "A3",
          width: 3508,
          height: 4961,
        },
        {
          name: "A4",
          width: 2480,
          height: 3508,
        },
        {
          name: "A5",
          width: 1748,
          height: 2480,
        },
        {
          name: "Letter",
          width: 2550,
          height: 3300,
        },
        {
          name: "Legal",
          width: 2550,
          height: 4200,
        },
        {
          name: "Business Card",
          width: 1050,
          height: 600,
        },
      ],
    },
    {
      name: "Web",
      items: [
        {
          name: "XGA",
          width: 1024,
          height: 768,
        },
        {
          name: "WXGA",
          width: 1280,
          height: 800,
        },
        {
          name: "WXGA+",
          width: 1440,
          height: 900,
        },
        {
          name: "FHD (1080p)",
          width: 1920,
          height: 1080,
        },
        {
          name: "WQHD (2K)",
          width: 2560,
          height: 1440,
        },
        {
          name: "QFHD (4K)",
          width: 3840,
          height: 2160,
        },
      ],
    },
  ],
});
