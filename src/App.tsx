import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paintbrush, Plus, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import { ColorPicker } from "@/components/ColorPicker";
import { Map } from "@/components/Map";
import { Input } from "@/components/ui/input";
// Add script.min.js import

const initialColors = {
  "cls-1": "#264653",
  "cls-2": "#287271",
  "cls-3": "#2a9d8f",
  "cls-4": "#8ab17d",
  "cls-5": "#e9c46a",
  "cls-6": "#f4a261",
  "cls-7": "#ee8959",
  "cls-8": "#e76f51",
};

const initialBgColor = {
  "cls-bg": "#f4eeca",
};

type ColorState = typeof initialColors;

// Add these types near the top of the file, after the initial constants
type ColorPalette = {
  seed: string;
  name: string;
  colors: string[];
  bg_color: string;
};

const colorPalettes: ColorPalette[] = [
  {
    seed: "1802",
    name: "lightRetro (neatmaps)",
    colors: [
      "264653", "287271", "2a9d8f", "8ab17d", "e9c46a", 
      "f4a261", "ee8959", "e76f51"
    ],
    bg_color: "f4eeca"
  },
  {
    seed: "2978",
    name: "helloginger",
    colors: ["c6c8ff", "c6c8ff", "cde2ff", "f7e981", "ffd5e5"],
    bg_color: "ffffff"
  }
];

const extractColorsFromCoolorsUrl = (url: string): string[] | null => {
  try {
    // Extract the part after the last slash
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Split by dash and filter out empty strings
    const colors = lastPart.split('-').filter(Boolean);
    
    // Validate that these are hex colors
    if (colors.every(color => /^[0-9A-Fa-f]{6}$/.test(color))) {
      return colors;
    }
    return null;
  } catch {
    return null;
  }
};

type ConsoleMessage = {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
};

const createConsoleProxy = (callback: (message: ConsoleMessage) => void) => {
  const originalConsole = { ...console };

  const proxyHandler = (type: ConsoleMessage['type']) => {
    return (...args: unknown[]) => {
      // Call the original console method
      const consoleObj: Record<string, (...args: unknown[]) => void> = originalConsole;
      consoleObj[type](...args);

      // Create a message object
      const message: ConsoleMessage = {
        type,
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        timestamp: new Date()
      };

      // Call the callback with the message
      callback(message);
    };
  };

  // Proxy the console methods
  console.log = proxyHandler('log');
  console.error = proxyHandler('error');
  console.warn = proxyHandler('warn');
  console.info = proxyHandler('info');

  // Return a cleanup function
  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  };
};

export default function App() {
  const [colors, setColors] = useState(initialColors);
  const [bgColor, setBgColor] = useState(initialBgColor);
  const { toast } = useToast();

  useEffect(() => {
    // Assign colors when component mounts
    assignRandomColors();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {


    // Add iframe content query
    const frame = document.getElementById("myFrame") as HTMLIFrameElement;
    
    // Wait for iframe to load
    frame.onload = () => {
        console.log('iframe has loaded / changed')
      try {
        // Add 2 second delay
        setTimeout(() => {
          const iframeDocument = frame;
          console.log(iframeDocument);
        //   if (iframeDocument) {
        //     // Get current iframe URL
        //     const iframeUrl = frame.contentWindow?.location.href;
        //     console.log('Iframe URL:', iframeUrl);
        //   }
        }, 2000);
      } catch (e) {
        console.error('Cannot access iframe content due to same-origin policy'); 
      }
    };

  }, []);

  const handleColorChange = (className: string, color: string) => {
    setColors((prev) => ({ ...prev, [className]: color }));
  };

  const handleBgColorChange = (className: string, color: string) => {
    setBgColor({ "cls-bg": color });
  };

  const addColor = () => {
    if (Object.keys(colors).length >= 10) {
      toast({
        title: "Maximum Colors Reached",
        description: "You can't add more than 10 colors.",
      });
      return;
    }

    const newIndex = Object.keys(colors).length + 1;
    const newColorKey = `cls-${newIndex}`;
    const randomColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;

    // Create new colors object with the new color
    const newColors = {
      ...colors,
      [newColorKey]: randomColor,
    };
    
    // Update state
    setColors(newColors);

    // Get all SVG paths
    const paths = document.querySelectorAll("#Layer_1 path");
    
    // Remove all possible color classes first
    paths.forEach(path => {
      if (path instanceof SVGPathElement) {
        for (let i = 1; i <= 10; i++) {
          path.classList.remove(`cls-${i}`);
        }
      }
    });

    // Create color assignments array based on new colors
    const pathsArray = Array.from(paths);
    const colorClasses = Object.keys(newColors);
    const colorAssignments: string[] = [];
    
    colorClasses.forEach((colorClass) => {
      const count = Math.ceil(pathsArray.length / colorClasses.length);
      colorAssignments.push(...Array(count).fill(colorClass));
    });

    // Trim excess assignments
    colorAssignments.splice(pathsArray.length);

    // Shuffle and assign colors
    const shuffledColors = colorAssignments.sort(() => Math.random() - 0.5);
    pathsArray.forEach((path, index) => {
      if (path instanceof SVGPathElement) {
        path.setAttribute("class", shuffledColors[index]);
      }
    });

    toast({
      title: "Color Added",
      description: "A new color has been added to your palette.",
    });
  };

  const removeColor = (className: string) => {
    if (Object.keys(colors).length <= 3) {
      toast({
        title: "Minimum Colors Reached",
        description: "You must have at least 3 colors.",
      });
      return;
    }

    // Type guard to ensure className is a valid key
    if (className in colors) {
      // Create new colors object without the removed color
      const newColors = { ...colors };
      delete newColors[className as keyof ColorState];
      
      // Update state
      setColors(newColors);

      // Get all SVG paths
      const paths = document.querySelectorAll("#Layer_1 path");
      
      // Remove all possible color classes first
      paths.forEach(path => {
        if (path instanceof SVGPathElement) {
          for (let i = 1; i <= 10; i++) {
            path.classList.remove(`cls-${i}`);
          }
        }
      });

      // Create color assignments array based on new colors
      const pathsArray = Array.from(paths);
      const colorClasses = Object.keys(newColors);
      const colorAssignments: string[] = [];
      
      colorClasses.forEach((colorClass) => {
        const count = Math.ceil(pathsArray.length / colorClasses.length);
        colorAssignments.push(...Array(count).fill(colorClass));
      });

      // Trim excess assignments
      colorAssignments.splice(pathsArray.length);

      // Shuffle and assign colors
      const shuffledColors = colorAssignments.sort(() => Math.random() - 0.5);
      pathsArray.forEach((path, index) => {
        if (path instanceof SVGPathElement) {
          path.setAttribute("class", shuffledColors[index]);
        }
      });

      toast({
        title: "Color Removed",
        description: "The color has been removed from your palette.",
      });
    }
  };

  const copyColors = async () => {
    const colorArray = Object.values(colors).map((color) =>
      color.replace("#", "")
    );
    try {
      await navigator.clipboard.writeText(JSON.stringify(colorArray));
      toast({
        title: "Colors Copied!",
        description: "Color array has been copied to clipboard.",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy colors to clipboard.",
      });
    }
  };

  const assignRandomColors = () => {
    const paths = document.querySelectorAll("#Layer_1 path");
    const colorClasses = Object.keys(colors);
    const pathsArray = Array.from(paths);

    // First, remove all existing color classes from paths
    pathsArray.forEach((path) => {
      if (path instanceof SVGPathElement) {
        colorClasses.forEach((cls) => path.classList.remove(cls));
      }
    });

    // Create an array with evenly distributed color indices
    const colorAssignments: string[] = [];
    colorClasses.forEach((colorClass) => {
      const count = Math.ceil(pathsArray.length / colorClasses.length);
      colorAssignments.push(...Array(count).fill(colorClass));
    });

    // Trim excess assignments if any
    colorAssignments.splice(pathsArray.length);

    // Shuffle the color assignments
    const shuffledColors = colorAssignments.sort(() => Math.random() - 0.5);

    // Assign the shuffled colors to paths
    pathsArray.forEach((path, index) => {
      if (path instanceof SVGPathElement) {
        path.setAttribute("class", shuffledColors[index]);
      }
    });

    toast({
      title: "Colors Distributed!",
      description: "Colors have been evenly distributed across the SVG.",
    });
  };

  const applyColorPalette = (palette: ColorPalette) => {
    // Create new colors object
    const newColors = {} as ColorState;
    palette.colors.forEach((color, index) => {
      newColors[`cls-${index + 1}` as keyof ColorState] = `#${color}`;
    });
    
    // Update state with new colors and background
    setColors(newColors);
    setBgColor({ "cls-bg": `#${palette.bg_color}` });

    // Get all SVG paths
    const paths = document.querySelectorAll("#Layer_1 path");
    
    // Remove all possible color classes first
    paths.forEach(path => {
      if (path instanceof SVGPathElement) {
        for (let i = 1; i <= 10; i++) {
          path.classList.remove(`cls-${i}`);
        }
      }
    });

    // Create color assignments array based on new colors
    const pathsArray = Array.from(paths);
    const colorClasses = Object.keys(newColors);
    const colorAssignments: string[] = [];
    
    colorClasses.forEach((colorClass) => {
      const count = Math.ceil(pathsArray.length / colorClasses.length);
      colorAssignments.push(...Array(count).fill(colorClass));
    });

    // Trim excess assignments
    colorAssignments.splice(pathsArray.length);

    // Shuffle and assign colors
    const shuffledColors = colorAssignments.sort(() => Math.random() - 0.5);
    pathsArray.forEach((path, index) => {
      if (path instanceof SVGPathElement) {
        path.setAttribute("class", shuffledColors[index]);
      }
    });

    toast({
      title: "Palette Applied",
      description: `Applied the ${palette.name} color palette.`,
    });
  };

  const handleCoolorsImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    
    if (input.includes('coolors.co/')) {
      const colors = extractColorsFromCoolorsUrl(input);
      
      if (!colors) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid Coolors.co palette URL.",
        });
        return;
      }

      if (colors.length < 3 || colors.length > 10) {
        toast({
          title: "Invalid Palette Size",
          description: "Palette must contain between 3 and 10 colors.",
        });
        return;
      }

      // Create new colors object
      const newColors = {} as ColorState;
      colors.forEach((color, index) => {
        newColors[`cls-${index + 1}` as keyof ColorState] = `#${color}`;
      });
      
      // Update state
      setColors(newColors);

      // Get all SVG paths
      const paths = document.querySelectorAll("#Layer_1 path");
      
      // Remove all possible color classes first
      paths.forEach(path => {
        if (path instanceof SVGPathElement) {
          for (let i = 1; i <= 10; i++) {
            path.classList.remove(`cls-${i}`);
          }
        }
      });

      // Create color assignments array based on new colors
      const pathsArray = Array.from(paths);
      const colorClasses = Object.keys(newColors);
      const colorAssignments: string[] = [];
      
      colorClasses.forEach((colorClass) => {
        const count = Math.ceil(pathsArray.length / colorClasses.length);
        colorAssignments.push(...Array(count).fill(colorClass));
      });

      // Trim excess assignments
      colorAssignments.splice(pathsArray.length);

      // Shuffle and assign colors
      const shuffledColors = colorAssignments.sort(() => Math.random() - 0.5);
      pathsArray.forEach((path, index) => {
        if (path instanceof SVGPathElement) {
          path.setAttribute("class", shuffledColors[index]);
        }
      });
      
      toast({
        title: "Colors Imported",
        description: `Successfully imported ${colors.length} colors from Coolors.`,
      });
      
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            neatmaps.co color generator
          </h1>
          <p className="text-muted-foreground">
            Custom Map Colors
          </p>
        </div>
        <Toaster />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="p-6">
              <div className="flex gap-6">
                {/* Background Color Section */}
                <div className="space-y-2 min-w-[200px]">
                  <h2 className="text-lg font-medium">Background Color</h2>
                  <div>
                    {Object.entries(bgColor).map(([className, color]) => (
                      <ColorPicker
                        key={className}
                        className={className}
                        color={color}
                        onColorChange={handleBgColorChange}
                        onRemove={() => {}}
                        showRemove={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Color Palettes Section */}
                <div className="space-y-4 flex-1">
                  <h2 className="text-lg font-medium">Color Palettes</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {colorPalettes.map((palette) => (
                      <Button
                        key={palette.seed}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => applyColorPalette(palette)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1 max-w-[100px]">
                            {palette.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 rounded-full border border-border"
                                style={{ backgroundColor: `#${color}` }}
                              />
                            ))}
                          </div>
                          <span className="ml-2">{palette.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(colors).map(([className, color]) => (
                  <ColorPicker
                    key={className}
                    className={className}
                    color={color}
                    onColorChange={handleColorChange}
                    onRemove={removeColor}
                  />
                ))}
              </div>

              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={assignRandomColors}
                  className="flex-1"
                  variant="outline"
                >
                  <Paintbrush className="mr-2 h-4 w-4" />
                  Shuffle Colors
                </Button>
                <Button
                  onClick={addColor}
                  variant="outline"
                  className="flex-1"
                  disabled={Object.keys(colors).length >= 10}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Color
                </Button>
                <Button onClick={copyColors} variant="outline" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Colors
                </Button>
              </div>
            </Card>
          </div>

          <Card
            className="p-6 aspect-square"
            style={{ backgroundColor: Object.values(bgColor)[0] }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <style>
                {`
                  ${Object.entries(colors)
                    .map(([className, color]) => `.${className} { fill: ${color}; }`)
                    .join('\n')}
                  .${Object.keys(bgColor)[0]} { fill: ${Object.values(bgColor)[0]}; }
                `}
              </style>
              <Map />
            </div>
          </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Coolors Import</h2>
                <Input
                  placeholder="Paste Coolors.co URL (e.g., coolors.co/palette/5f0f40-9a031e...)"
                  onChange={handleCoolorsImport}
                />
                <div className="w-full h-[500px] overflow-hidden rounded-lg border border-border">
                  <iframe 
                    src="https://www.coolors.co/generate"
                    className="w-full h-full"
                    title="Coolors Color Palette"
                    id="myFrame"
                  />
                </div>
              </div>
            </Card>

        </div>
      </div>
    </div>
  );
}
