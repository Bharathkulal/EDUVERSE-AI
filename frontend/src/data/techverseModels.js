// ============================================================================
// EDUVERSE 3D TECHVERSE - PROCEDURAL MODELS DATABASE
// ============================================================================
// Contains metadata, specs, quizzes, flashcards, and shape templates
// for Computer Hardware, Networking, Electronics, and Software Visualizations.

// Pre-defined color palettes for high-quality tech aesthetics
export const TECH_COLORS = {
  pcb: '#0F5F38',       // Classic circuit board green
  pcbDark: '#0A3C24',   // Dark green
  silicon: '#334155',   // Slate gray
  chipCore: '#1E293B',  // Dark slate
  gold: '#F59E0B',      // Shiny contact yellow
  copper: '#B45309',    // Orange-brown copper
  solder: '#94A3B8',    // Silver solder
  rgbRed: '#EF4444',
  rgbGreen: '#10B981',
  rgbBlue: '#3B82F6',
  acrylic: 'rgba(59, 130, 246, 0.35)', // Transparent blue glass
  casingLight: '#E2E8F0', // Aluminum silver
  casingDark: '#1E293B',  // Graphite gray
  wiring: '#6366F1',     // Indigo link lines
  activeNode: '#10B981', // Glowing neon green
  inactiveNode: '#475569' // Dull node gray
};

export const MODELS_DATA = {
  // ==========================================================================
  // COMPUTER HARDWARE (42 Models)
  // ==========================================================================
  cpu: {
    id: 'cpu',
    name: 'Intel Core i9 Processor',
    category: 'hardware',
    synonyms: ['cpu', 'processor', 'intel cpu', 'amd cpu', 'core i9', 'lga socket', 'die', 'cache layers', 'processor package', 'heat spreader', 'intel', 'amd'],
    description: 'Central Processing Unit - The primary microprocessor executing instructions via binary logic.',
    specifications: '16 Cores, 24 Threads | Base Clock 3.2GHz | Max Turbo 5.2GHz | TDP 125W | Socket LGA1700',
    history: 'CPU architecture traces back to the Intel 4004 in 1971, evolving from simple calculators to complex multi-core nanometer chips today.',
    workingPrinciple: 'Operates on the Fetch-Decode-Execute cycle, fetching binary instructions from RAM, decoding via Control Unit, and computing operations through the ALU.',
    advantages: 'Highest serial execution performance, smart tiered caching, high clock speeds.',
    disadvantages: 'High thermal output, requires active liquid or air cooling, high power consumption.',
    applications: 'PCs, servers, automated control systems, supercomputers.',
    manufacturers: 'Intel, AMD, Qualcomm, Apple, TSMC.',
    realWorldUsage: 'Main processing engine of desktop gaming consoles and workstations.',
    commonProblems: 'Overheating leading to thermal throttling, bent pins during socket installation, excessive voltage degradation.',
    repairGuide: 'Handle strictly by PCB substrate edges. Wipe thermal paste with Isopropyl alcohol, apply a pea-sized paste dot, and mount the cooling pump firmly.',
    quiz: [
      { q: 'What is the function of the ALU inside the CPU?', o: ['Decode code commands', 'Perform arithmetic/logic operations', 'Hold intermediate variables', 'Regulate the system clock speed'], a: 1 },
      { q: 'Which Cache level is the fastest but smallest?', o: ['L1 Cache', 'L2 Cache', 'L3 Cache', 'System RAM'], a: 0 }
    ],
    flashcards: [
      { q: 'What does CPU stand for?', a: 'Central Processing Unit' },
      { q: 'What is the standard clock speed unit for modern CPUs?', a: 'Gigahertz (GHz)' }
    ],
    parts: [
      { name: 'Heat Spreader (IHS)', desc: 'Copper nickel-plated shell diffusing heat from the silicon die to the external cooler.' },
      { name: 'Silicon Core Die', desc: 'The actual semiconductor microchip containing billions of microscopic transistors.' },
      { name: 'Cache Memory (L3)', desc: 'Ultra-fast memory buffer layered on the die for swift instruction pipelines.' },
      { name: 'Substrate & Gold Pins', desc: 'PCB foundation carrying signals from motherboard socket pads via golden contacts.' }
    ],
    shapes: [
      { shape: 'box', size: [12, 1, 12], color: TECH_COLORS.casingLight, name: 'Substrate PCB Base', offset: [0, -1, 0] },
      { shape: 'box', size: [10, 1.2, 10], color: TECH_COLORS.solder, name: 'Integrated Heat Spreader (IHS)', offset: [0, 0.8, 0] },
      { shape: 'box', size: [4, 0.4, 4], color: TECH_COLORS.silicon, name: 'Silicon Core Die', offset: [0, 0, 0] },
      { shape: 'box', size: [3.5, 0.2, 3.5], color: TECH_COLORS.gold, name: 'L1/L2/L3 Cache Layer', offset: [0, 0.3, 0] },
      { shape: 'box', size: [11.8, 0.1, 11.8], color: TECH_COLORS.gold, name: 'LGA Gold Contact Pins', offset: [0, -1.1, 0] }
    ]
  },
  gpu: {
    id: 'gpu',
    name: 'NVIDIA RTX Graphics Processing Unit',
    category: 'hardware',
    synonyms: ['gpu', 'graphics card', 'video card', 'vga', 'geforce', 'nvidia', 'amd radeon'],
    description: 'Graphics Processing Unit - High-throughput parallel processor designed for rendering 3D graphics and AI calculations.',
    specifications: '16GB GDDR6X VRAM | 9728 CUDA Cores | PCIe Gen 5.0 | 256-bit Memory Bus',
    history: 'GPU emerged from fixed-function graphics cards of the 1980s, becoming fully programmable processors in the late 1990s (GeForce 256).',
    workingPrinciple: 'Splits calculations across thousands of arithmetic pipelines to render rasterized triangles, trace rays, or run matrix tensor calculations in parallel.',
    advantages: 'Massive parallel math throughput, specialized ray tracing hardware cores.',
    disadvantages: 'High power draw (up to 450W), large physical footprint, high cost.',
    applications: '3D rendering, machine learning training, scientific simulations, gaming.',
    manufacturers: 'NVIDIA, AMD, Intel, TSMC.',
    realWorldUsage: 'Accelerating AI models, texture mapping, and physics rendering.',
    commonProblems: 'VRAM artifacting due to thermal breakdown, fan bearing wear, driver crashes.',
    repairGuide: 'Replace thermal pads on hot VRAM chips. Clean fans with compressed air. Ensure dual PCIe power connectors are securely plugged in.',
    quiz: [
      { q: 'What type of memory does modern GPU use?', o: ['SRAM', 'DDR5', 'GDDR6X', 'EEPROM'], a: 2 }
    ],
    flashcards: [
      { q: 'What is a CUDA core?', a: 'A parallel computing core developed by NVIDIA for GPUs.' }
    ],
    parts: [
      { name: 'GPU Silicon Die', desc: 'Large silicon chip holding shading units, RT cores, and tensor hardware.' },
      { name: 'VRAM Chips', desc: 'High-bandwidth memory chips surrounding the core GPU for quick buffer access.' },
      { name: 'Cooling Fin Stack', desc: 'Dense aluminum array with heatpipes to dissipate thermal load.' },
      { name: 'Fans & Cover', desc: 'Active air ventilation system pushing air through the fin stack.' }
    ],
    shapes: [
      { shape: 'box', size: [20, 1.2, 10], color: TECH_COLORS.casingDark, name: 'GPU PCB Board', offset: [0, -1, 0] },
      { shape: 'box', size: [6, 1.5, 6], color: TECH_COLORS.silicon, name: 'GPU Silicon Core Die', offset: [-2, 0.4, 0] },
      { shape: 'box', size: [2, 1, 2], color: TECH_COLORS.chipCore, name: 'GDDR6 Memory Chip 1', offset: [-6, 0.2, 2] },
      { shape: 'box', size: [2, 1, 2], color: TECH_COLORS.chipCore, name: 'GDDR6 Memory Chip 2', offset: [-6, 0.2, -2] },
      { shape: 'box', size: [18, 4, 8], color: TECH_COLORS.solder, name: 'Aluminum Heatsink Fins', offset: [0, 3, 0] },
      { shape: 'cylinder', radius: 3, height: 1, segments: 12, color: '#000000', name: 'Cooling Fan 1', offset: [-4, 5.2, 0] },
      { shape: 'cylinder', radius: 3, height: 1, segments: 12, color: '#000000', name: 'Cooling Fan 2', offset: [4, 5.2, 0] }
    ]
  },
  ram: {
    id: 'ram',
    name: 'DDR5 RGB Desktop RAM',
    category: 'hardware',
    synonyms: ['ram', 'memory', 'ddr5', 'ddr4', 'ddr3', 'rgb ram', 'laptop ram', 'memory module', 'memory slot', 'memory controller', 'memory bus', 'ecc ram'],
    description: 'Random Access Memory - Ultra-fast volatile memory module storing active code and dynamic structures.',
    specifications: '32GB DDR5 Dual Channel | 5600 MHz Speed | CL40 Latency | 1.1 Volts Operating Power',
    history: 'RAM progressed from vacuum tubes and magnetic core storage to asynchronous DRAM, DDR1-5, dramatically expanding memory bus throughput.',
    workingPrinciple: 'Stores charge inside capacitors representing bits (1 or 0). Charge state is kept alive via automatic row refresh cycles.',
    advantages: 'Sub-nanosecond read/write access, high density, crucial for multitasking.',
    disadvantages: 'Volatile (data is completely lost when power is disconnected), expensive per gigabyte.',
    applications: 'System scratchpad, buffering files, caching database pages.',
    manufacturers: 'Samsung, Micron, SK Hynix, G.Skill, Corsair.',
    realWorldUsage: 'Main memory module providing CPU with raw data code feeds.',
    commonProblems: 'Blue screen of death (BSOD) errors, failure to POST, memory leaks.',
    repairGuide: 'Clean golden contact teeth with an eraser if RAM fails to boot. Align the keyed notch correctly before pushing down into the slot until locks click.',
    quiz: [
      { q: 'Why is RAM referred to as volatile memory?', o: ['It breaks easily', 'It loses data when powered off', 'It changes speed dynamically', 'It contains hazardous chemicals'], a: 1 }
    ],
    flashcards: [
      { q: 'What does DDR stand for?', a: 'Double Data Rate' }
    ],
    parts: [
      { name: 'Memory Chips (DRAM)', desc: 'Individual semiconductor chips storing bits via capacitor/transistor arrays.' },
      { name: 'PCB Board', desc: 'Multi-layer board routing address, data, and control line signals to host bus.' },
      { name: 'RGB LED Diffuser Bar', desc: 'Acrylic light strip decorating memory module with customized glowing styles.' },
      { name: 'Gold Pins Connector', desc: 'Golden contacts designed for slots to prevent impedance degradation.' }
    ],
    shapes: [
      { shape: 'box', size: [20, 4, 0.5], color: TECH_COLORS.pcb, name: 'RAM PCB Board', offset: [0, 0, 0] },
      { shape: 'box', size: [3, 2, 0.6], color: TECH_COLORS.chipCore, name: 'DRAM Chip 1', offset: [-6, 0.5, 0.2] },
      { shape: 'box', size: [3, 2, 0.6], color: TECH_COLORS.chipCore, name: 'DRAM Chip 2', offset: [-2, 0.5, 0.2] },
      { shape: 'box', size: [3, 2, 0.6], color: TECH_COLORS.chipCore, name: 'DRAM Chip 3', offset: [2, 0.5, 0.2] },
      { shape: 'box', size: [3, 2, 0.6], color: TECH_COLORS.chipCore, name: 'DRAM Chip 4', offset: [6, 0.5, 0.2] },
      { shape: 'box', size: [19.8, 0.5, 0.6], color: TECH_COLORS.gold, name: 'Gold Pin Interface', offset: [0, -2.1, 0] },
      { shape: 'box', size: [20, 0.6, 0.8], color: '#FFFFFF', name: 'RGB LED Accent Glow Bar', offset: [0, 2.2, 0] }
    ]
  },
  rom: {
    id: 'rom',
    name: 'EEPROM ROM Chip',
    category: 'hardware',
    synonyms: ['rom', 'read only memory', 'eeprom', 'flash rom', 'bios memory'],
    description: 'Read-Only Memory - Non-volatile memory storing boot firmware, permanent system settings, and core start instructions.',
    specifications: '8MB Flash Memory | 8-Pin DIP Package | SPI Interface | 3.3V Operating Voltage',
    history: 'ROM evolved from mask-programmed chips to erasable programmable versions (EPROM, EEPROM, and Flash).',
    workingPrinciple: 'Stores bits using floating gate transistors that retain electrons even without external power applied.',
    advantages: 'Non-volatile, immune to system crashes, cannot be written to accidentally.',
    disadvantages: 'Extremely slow write speeds, limited write/erase cycles.',
    applications: 'BIOS storage, firmware, embedded systems, microcontrollers.',
    manufacturers: 'Winbond, Macronix, Microchip, STMicroelectronics.',
    realWorldUsage: 'Bootloader code for computers, router setups, and smart appliances.',
    commonProblems: 'Firmware corruption (bricked BIOS), pin breakage, memory wear.',
    repairGuide: 'Re-flash ROM chip using an external SPI Programmer or short BIOS recovery pins on motherboard.',
    quiz: [
      { q: 'EEPROM stands for Electrically ______ Programmable Read-Only Memory. Fill in the blank.', o: ['Erasable', 'Encryptable', 'Extendable', 'Efficient'], a: 0 }
    ],
    flashcards: [
      { q: 'Is ROM volatile or non-volatile?', a: 'Non-volatile' }
    ],
    parts: [
      { name: 'Silicon Die ROM', desc: 'Core matrix containing floating gate transistors.' },
      { name: 'Plastic Package Casing', desc: 'Protective epoxy block covering internal bonding wires.' },
      { name: 'Metal Contact Pins', desc: 'Legs conducting SPI signals to socket.' }
    ],
    shapes: [
      { shape: 'box', size: [8, 3, 12], color: '#111827', name: 'Plastic Package Casing', offset: [0, 1.5, 0] },
      { shape: 'box', size: [1, 5, 0.5], color: TECH_COLORS.solder, name: 'Contact Pin 1', offset: [-4.2, -1, -4] },
      { shape: 'box', size: [1, 5, 0.5], color: TECH_COLORS.solder, name: 'Contact Pin 2', offset: [-4.2, -1, -1.3] },
      { shape: 'box', size: [1, 5, 0.5], color: TECH_COLORS.solder, name: 'Contact Pin 3', offset: [-4.2, -1, 1.3] },
      { shape: 'box', size: [1, 5, 0.5], color: TECH_COLORS.solder, name: 'Contact Pin 4', offset: [-4.2, -1, 4] },
      { shape: 'box', size: [1, 5, 0.5], color: TECH_COLORS.solder, name: 'Contact Pin 5', offset: [4.2, -1, -4] },
      { shape: 'box', size: [1, 5, 0.5], color: TECH_COLORS.solder, name: 'Contact Pin 6', offset: [4.2, -1, -1.3] },
      { shape: 'box', size: [1, 5, 0.5], color: TECH_COLORS.solder, name: 'Contact Pin 7', offset: [4.2, -1, 1.3] },
      { shape: 'box', size: [1, 5, 0.5], color: TECH_COLORS.solder, name: 'Contact Pin 8', offset: [4.2, -1, 4] }
    ]
  },
  motherboard: {
    id: 'motherboard',
    name: 'ATX Gaming Motherboard',
    category: 'hardware',
    synonyms: ['motherboard', 'mainboard', 'pcb', 'atx motherboard', 'chipset', 'vrins'],
    description: 'Motherboard - The primary printed circuit board linking all components (CPU, RAM, storage, expansion).',
    specifications: 'Z790 Chipset | 4x DDR5 Slots | 3x PCIe Gen 5.0 | Wi-Fi 6E | 4x M.2 Slots',
    history: 'Early computers used point-to-point wiring; motherboards consolidated components into multi-layer copper-trace PCBs during the late 1980s.',
    workingPrinciple: 'Coordinates communication channels via high-speed trace buses (PCIe, QPI, DMI) managed by system Chipsets.',
    advantages: 'Centralizes communications, supports expansion, integrates voltage converters (VRM).',
    disadvantages: 'Difficult to replace, static electricity damage risks.',
    applications: 'Computers, industrial controllers, custom electronics.',
    manufacturers: 'ASUS, Gigabyte, MSI, ASRock, Intel.',
    realWorldUsage: 'The backbone interface for a custom PC build.',
    commonProblems: 'Blown capacitors, short circuits, dead CMOS battery.',
    repairGuide: 'If boot loops occur, remove CMOS battery for 30s to clear BIOS settings. Inspect VRM areas for brown burn marks.',
    quiz: [
      { q: 'Which motherboard component keeps settings and real-time clock alive when power is lost?', o: ['SATA bus', 'BIOS ROM', 'CMOS Battery', 'Northbridge Chipset'], a: 2 }
    ],
    flashcards: [
      { q: 'What does ATX stand for?', a: 'Advanced Technology Extended (form factor standard)' }
    ],
    parts: [
      { name: 'CPU Socket', desc: 'Central housing with metal pin contacts matching the CPU substrate.' },
      { name: 'DDR Memory Slots', desc: 'Four parallel slots directing memory lines to the processor.' },
      { name: 'PCIe 5.0 Slot', desc: 'Primary high-speed socket designed for graphics accelerators.' },
      { name: 'CMOS battery', desc: 'Lithium button cell supplying permanent memory clock voltage.' }
    ],
    shapes: [
      { shape: 'box', size: [18, 18, 0.5], color: TECH_COLORS.pcbDark, name: 'Motherboard PCB Board', offset: [0, 0, 0] },
      { shape: 'box', size: [4.5, 4.5, 0.6], color: TECH_COLORS.solder, name: 'LGA CPU Socket Mount', offset: [-3, 3, 0.4] },
      { shape: 'box', size: [0.4, 7, 0.8], color: TECH_COLORS.chipCore, name: 'DDR Slot 1', offset: [3.5, 3.5, 0.5] },
      { shape: 'box', size: [0.4, 7, 0.8], color: TECH_COLORS.chipCore, name: 'DDR Slot 2', offset: [4.5, 3.5, 0.5] },
      { shape: 'box', size: [10, 0.5, 0.8], color: TECH_COLORS.chipCore, name: 'PCIe Gen 5 Slot', offset: [-2, -2, 0.5] },
      { shape: 'cylinder', radius: 1.5, height: 0.4, segments: 12, color: TECH_COLORS.casingLight, name: 'CMOS Battery Holder', offset: [4.5, -4, 0.4] },
      { shape: 'box', size: [2.5, 2.5, 0.8], color: TECH_COLORS.silicon, name: 'Motherboard Chipset', offset: [3, -1, 0.4] }
    ]
  },
  northbridge: {
    id: 'northbridge',
    name: 'Northbridge Chipset Controller',
    category: 'hardware',
    synonyms: ['northbridge', 'memory controller hub', 'mch', 'motherboard chip'],
    description: 'Northbridge - High-speed memory controller hub handling data channels between CPU, RAM, and graphics cards in legacy architectures.',
    specifications: 'FSB 1333MHz | Memory Controller Hub | AGP/PCIe Controller | 90nm Process Node',
    history: 'A core part of the traditional Intel/AMD dual-chip chipset. Modern CPUs have completely integrated these controllers directly into the processor die.',
    workingPrinciple: 'Acts as a direct mediator bridge converting high-speed CPU bus signals into standard PCI Express and memory channel calls.',
    advantages: 'Direct high-bandwidth link to processor, low latency bridging.',
    disadvantages: 'Runs hot, bottlenecks bandwidth under intensive multi-core usage.',
    applications: 'Legacy motherboards (Intel Core 2 Duo era and older).',
    manufacturers: 'Intel, NVIDIA, AMD/ATI, VIA.',
    realWorldUsage: 'Regulating legacy front-side bus signals on retro PC motherboards.',
    commonProblems: 'Solder joint cracking due to thermal stress, overheating heatsink failure.',
    repairGuide: 'Apply reflow heating to correct cracked solder balls, or install active micro fan on the Northbridge heatsink.',
    quiz: [
      { q: 'Which two major high-speed components did the Northbridge bridge to the CPU?', o: ['Hard drive and LAN', 'RAM and GPU', 'BIOS and CMOS', 'Audio and USB ports'], a: 1 }
    ],
    flashcards: [
      { q: 'Where was the Northbridge located?', a: 'Close to the CPU socket, for shortest trace routes.' }
    ],
    parts: [
      { name: 'Silicon Hub Core', desc: 'The hub logic gate arrays routing high-speed front-side bus data.' },
      { name: 'Passive Aluminum Heatsink', desc: 'Metal fins mounted directly onto the silicon to transfer heat.' }
    ],
    shapes: [
      { shape: 'box', size: [4, 0.4, 4], color: TECH_COLORS.silicon, name: 'Silicon Core Hub', offset: [0, 0, 0] },
      { shape: 'box', size: [3.8, 2, 3.8], color: TECH_COLORS.casingLight, name: 'Aluminum Heatsink Fins', offset: [0, 1.2, 0] }
    ]
  },
  southbridge: {
    id: 'southbridge',
    name: 'Southbridge IO Controller Hub',
    category: 'hardware',
    synonyms: ['southbridge', 'io controller hub', 'ich', 'motherboard controller'],
    description: 'Southbridge - IO controller hub routing communication for lower-speed peripheral buses (SATA, USB, PCI, Audio).',
    specifications: 'SATA II/III | USB 2.0/3.0 | PCI Bus Controller | LPC interface for BIOS',
    history: 'Paired with the Northbridge. Relieved processor by managing low-speed interrupts.',
    workingPrinciple: 'Aggregates peripheral requests, handles DMA channels, and communicates back to CPU via a dedicated bridge link to the Northbridge.',
    advantages: 'Simplifies CPU design, aggregates multiple peripheral buses.',
    disadvantages: 'High peripheral load can delay system interrupts.',
    applications: 'Desktop and laptop motherboards prior to modern SoC system boards.',
    manufacturers: 'Intel, AMD, VIA, SiS.',
    realWorldUsage: 'Handling audio jacks, hard drive lines, and keyboard inputs.',
    commonProblems: 'USB port short circuits, BIOS communication link failures.',
    repairGuide: 'Check for blown inline fuses near back IO USB ports before replacing motherboard board components.',
    quiz: [
      { q: 'Which standard interface did the Southbridge manage?', o: ['System RAM', 'PCI Express x16 graphics card', 'SATA Storage Drives', 'CPU Level 2 Cache'], a: 2 }
    ],
    flashcards: [
      { q: 'Is Southbridge connected directly to the CPU?', a: 'No, it connects through the Northbridge or similar DMI interface.' }
    ],
    parts: [
      { name: 'Silicon Controller Core', desc: 'Processes IO register controls and interrupt lines.' },
      { name: 'BGA Pins Grid', desc: 'Grid array underneath mounting chip to board traces.' }
    ],
    shapes: [
      { shape: 'box', size: [5, 0.6, 5], color: TECH_COLORS.chipCore, name: 'Silicon Controller Chip', offset: [0, 0, 0] },
      { shape: 'box', size: [4.8, 0.1, 4.8], color: TECH_COLORS.solder, name: 'BGA Pin Contacts Matrix', offset: [0, -0.3, 0] }
    ]
  },
  cmos_battery: {
    id: 'cmos_battery',
    name: 'CMOS CR2032 Lithium Coin Battery',
    category: 'hardware',
    synonyms: ['cmos battery', 'cr2032', 'rtc battery', 'coin cell', 'bios battery'],
    description: 'CMOS Battery - Small lithium coin cell powering the Real-Time Clock (RTC) and volatile BIOS memory when system is unplugged.',
    specifications: 'CR2032 Lithium | 3.0 Volts | 225mAh capacity | Diameter 20mm',
    history: 'Introduced as personal computers needed to persist date/time configurations without main wall power.',
    workingPrinciple: 'Lithium-manganese dioxide chemistry yields a continuous 3V discharge line over years of low microamp draw.',
    advantages: 'Long shelf life (10 years), stable voltage curve, cheap and easy to swap.',
    disadvantages: 'Low capacity, can leak acid in old devices.',
    applications: 'Motherboards, handheld calculators, smart watches.',
    manufacturers: 'Panasonic, Maxell, Energizer, Sony.',
    realWorldUsage: 'Maintains system calendar time when computer is powered off.',
    commonProblems: 'Loss of system time, "CMOS Checksum Error" on boot.',
    repairGuide: 'Use a plastic tool to push socket tab outward. The battery pops up. Replace with a fresh CR2032 with positive (+) face pointing up.',
    quiz: [
      { q: 'What standard voltage does a CMOS CR2032 battery supply?', o: ['1.5V', '3.0V', '5.0V', '12.0V'], a: 1 }
    ],
    flashcards: [
      { q: 'What happens if CMOS battery fails?', a: 'BIOS resets to factory defaults, and system clock loses correct date/time.' }
    ],
    parts: [
      { name: 'Lithium Cell Body', desc: 'Stainless steel coin housing holding chemical reactants.' },
      { name: 'Retention Bracket', desc: 'Plastic mount on motherboard with positive contact clips.' }
    ],
    shapes: [
      { shape: 'cylinder', radius: 3, height: 0.6, segments: 16, color: TECH_COLORS.casingLight, name: 'Lithium Cell Body', offset: [0, 0.4, 0] },
      { shape: 'cylinder', radius: 3.4, height: 0.8, segments: 16, color: '#1E293B', name: 'Plastic Bracket Mount', offset: [0, 0, 0] },
      { shape: 'box', size: [1, 1, 1.2], color: TECH_COLORS.gold, name: 'Positive Contact Clip', offset: [3, 0.4, 0] }
    ]
  },
  bios_chip: {
    id: 'bios_chip',
    name: 'BIOS Flash ROM Chip',
    category: 'hardware',
    synonyms: ['bios chip', 'bios firmware', 'flash memory bios', 'uefi chip'],
    description: 'BIOS Chip - Non-volatile flash storage chip holding initial software startup protocols (POST, boot settings).',
    specifications: '32MB SPI Flash | SOIC-8 Package | UEFI Interface | 3.3V power footprint',
    history: 'Evolved from legacy keyboard chips to EEPROMs, enabling firmware upgrades without hardware replacement.',
    workingPrinciple: 'Stores UEFI boot instructions readable by CPU upon power activation (Reset Vector).',
    advantages: 'Stores system parameters, allows reflashing for CPU compatibility upgrades.',
    disadvantages: 'Vulnerable to corrupted writes, bricking motherboard.',
    applications: 'Motherboards, network cards, graphics adapters.',
    manufacturers: 'Winbond, Macronix, GigaDevice, Infineon.',
    realWorldUsage: 'Loads basic keyboard and driver mappings before hands-off to OS.',
    commonProblems: 'Corruption during firmware updates (bricked motherboard), write protection flags.',
    repairGuide: 'Re-flash using standard SPI programmer clamp (CH341A) or dual-BIOS backup switch if motherboards support it.',
    quiz: [
      { q: 'What does BIOS stand for?', o: ['Binary Input Operating System', 'Basic Input Output System', 'Boot Interface Operation Standard', 'Broadband Integrated Output Scheduler'], a: 1 }
    ],
    flashcards: [
      { q: 'What is a POST test?', a: 'Power-On Self-Test (checks hardware presence before loading OS)' }
    ],
    parts: [
      { name: 'EEPROM Core Die', desc: 'SPI flash memory storing code blocks.' },
      { name: 'Lead Frame Pins', desc: 'SMD contacts transmitting code bytes.' }
    ],
    shapes: [
      { shape: 'box', size: [5, 1.5, 6], color: TECH_COLORS.chipCore, name: 'SOIC-8 Plastic Body', offset: [0, 0.5, 0] },
      { shape: 'box', size: [0.8, 0.2, 1], color: TECH_COLORS.solder, name: 'SPI Pin 1', offset: [-2.6, 0.1, -2] },
      { shape: 'box', size: [0.8, 0.2, 1], color: TECH_COLORS.solder, name: 'SPI Pin 2', offset: [-2.6, 0.1, -0.6] },
      { shape: 'box', size: [0.8, 0.2, 1], color: TECH_COLORS.solder, name: 'SPI Pin 3', offset: [-2.6, 0.1, 0.6] },
      { shape: 'box', size: [0.8, 0.2, 1], color: TECH_COLORS.solder, name: 'SPI Pin 4', offset: [-2.6, 0.1, 2] },
      { shape: 'box', size: [0.8, 0.2, 1], color: TECH_COLORS.solder, name: 'SPI Pin 5', offset: [2.6, 0.1, -2] },
      { shape: 'box', size: [0.8, 0.2, 1], color: TECH_COLORS.solder, name: 'SPI Pin 6', offset: [2.6, 0.1, -0.6] },
      { shape: 'box', size: [0.8, 0.2, 1], color: TECH_COLORS.solder, name: 'SPI Pin 7', offset: [2.6, 0.1, 0.6] },
      { shape: 'box', size: [0.8, 0.2, 1], color: TECH_COLORS.solder, name: 'SPI Pin 8', offset: [2.6, 0.1, 2] }
    ]
  },
  power_supply: {
    id: 'power_supply',
    name: 'ATX Modular Power Supply Unit (PSU)',
    category: 'hardware',
    synonyms: ['power supply', 'psu', 'smps', 'power adapter', 'modular psu'],
    description: 'Power Supply Unit - Converts alternating current (AC) wall power into steady direct current (DC) for computer electronics.',
    specifications: '850 Watts | 80 Plus Gold Rated | Fully Modular | +12V Single Rail (70.8A)',
    history: 'Computers migrated from linear power supplies to compact Switched-Mode Power Supplies (SMPS) in the 1970s.',
    workingPrinciple: 'Utilizes high-frequency switching regulators, step-down transformers, and filters to step down 240V AC to stable +3.3V, +5V, and +12V DC lines.',
    advantages: 'High efficiency, modular cabling tidies case airflow, multiple safety protections (OVP, UVP).',
    disadvantages: 'Generates fan noise, heavy, dangerous voltage capacitors inside casing.',
    applications: 'PCs, server chassis, arcade systems, lab equipment.',
    manufacturers: 'Corsair, EVGA, Seasonic, Cooler Master.',
    realWorldUsage: 'Supplying clean DC juice to high-end motherboards and GPU cards.',
    commonProblems: 'Blown safety fuse, fan noise clicks, coil whine, capacitor swelling.',
    repairGuide: '⚠️ WARNING: High-voltage warning inside. Never open PSU casing. Use modular cable tester blocks to test rail voltages.',
    quiz: [
      { q: 'Which voltage rail powers modern computer CPU and GPU components?', o: ['+3.3V', '+5V', '+12V', '-12V'], a: 2 }
    ],
    flashcards: [
      { q: 'What does 80 Plus mean?', a: 'A certification rating indicating the PSU is over 80% efficient under load.' }
    ],
    parts: [
      { name: 'Metal Casing', desc: 'Shielding enclosure isolating electro-magnetic interference.' },
      { name: 'Cooling Fan', desc: 'Large fan exhausting hot air from internal transformers.' },
      { name: 'Transformer Block', desc: 'Induction coils stepping down current voltages.' },
      { name: 'Modular Output Panel', desc: 'Jack ports for plugging in custom 24-pin and 8-pin system cords.' }
    ],
    shapes: [
      { shape: 'box', size: [12, 10, 12], color: '#111827', name: 'Metal Casing Enclosure', offset: [0, 0, 0] },
      { shape: 'cylinder', radius: 4, height: 1, segments: 16, color: TECH_COLORS.silicon, name: 'Cooling Fan Intake', offset: [0, 5.1, 0] },
      { shape: 'box', size: [11.8, 9.8, 0.4], color: '#000000', name: 'Modular Cable Jack Panel', offset: [0, 0, 5.1] },
      { shape: 'box', size: [4, 4, 4], color: TECH_COLORS.copper, name: 'Internal Copper Transformer', offset: [-2, -2, -2] }
    ]
  },
  hard_disk: {
    id: 'hard_disk',
    name: 'Mechanical Hard Disk Drive (HDD)',
    category: 'hardware',
    synonyms: ['hard disk', 'hdd', 'mechanical drive', 'sata disk', 'magnetic drive'],
    description: 'Hard Disk Drive - High-capacity magnetic storage device storing data non-volatilely on rotating platters.',
    specifications: '4TB Capacity | 7200 RPM Spin Rate | SATA III 6Gbps | 256MB Cache',
    history: 'Invented by IBM in 1956 (RAMAC), advancing from room-sized cabinets to compact 3.5-inch and 2.5-inch modules.',
    workingPrinciple: 'Writes data by magnetizing micro-tracks on aluminum/glass disks via electromagnetic write-heads held by actuator arms.',
    advantages: 'Very cheap cost per gigabyte, stable long-term cold storage archives.',
    disadvantages: 'Slow read/write speeds, high latency, susceptible to physical drop damage.',
    applications: 'NAS storage clusters, security server vaults, media backups.',
    manufacturers: 'Seagate, Western Digital, Toshiba.',
    realWorldUsage: 'Storing large system file archives and game library files.',
    commonProblems: 'Mechanical head crashes, spindle motor seizure, bad sectors.',
    repairGuide: 'Run CHKDSK software sweeps to map out dead sectors. If physical "clicking of death" occurs, raw recovery requires cleanroom platter transplants.',
    quiz: [
      { q: 'Which component reads data from spinning hard disk platters?', o: ['Actuator Arm Head', 'CMOS logic probe', 'SATA buffer bus', 'Flash gate transistor'], a: 0 }
    ],
    flashcards: [
      { q: 'What is a bad sector?', a: 'A physically damaged sector on the magnetic platter that can no longer hold data.' }
    ],
    parts: [
      { name: 'Magnetic Platters', desc: 'Polished disks coated with thin magnetic layers storing bits.' },
      { name: 'Spindle Motor', desc: 'Direct-drive electric motor spinning platters at 7200 RPM.' },
      { name: 'Actuator Arm', desc: 'Micro-stepping arm moving magnetic read-heads across tracks.' },
      { name: 'Controller Board', desc: 'Circuit board on bottom controlling cache buffers and motor cycles.' }
    ],
    shapes: [
      { shape: 'box', size: [10, 2, 14], color: TECH_COLORS.casingLight, name: 'Metal Sealed Housing', offset: [0, 0, 0] },
      { shape: 'cylinder', radius: 4.5, height: 0.4, segments: 16, color: TECH_COLORS.solder, name: 'Magnetic Platter Stack', offset: [0, 1.1, -2] },
      { shape: 'box', size: [1, 0.4, 6], color: TECH_COLORS.silicon, name: 'Actuator Read/Write Arm', offset: [2.5, 1.1, 3] },
      { shape: 'box', size: [9.8, 0.2, 4], color: TECH_COLORS.pcb, name: 'SATA Logic Interface board', offset: [0, -1.1, 5] }
    ]
  },
  ssd: {
    id: 'ssd',
    name: 'SATA Solid State Drive (SSD)',
    category: 'hardware',
    synonyms: ['ssd', 'solid state drive', 'sata ssd', 'flash storage', '2.5 ssd'],
    description: 'Solid State Drive - High-performance storage device using flash memory to read and write non-volatile files.',
    specifications: '1TB Storage | 2.5-inch Form Factor | SATA III interface (600MB/s) | MLC NAND',
    history: 'Evolved from volatile ramdisks to flash-based drives, commercializing in 2.5-inch slots in the late 2000s.',
    workingPrinciple: 'Bypasses moving parts. Uses a flash controller chip to route operations to NAND cell grids.',
    advantages: 'Fast boot speeds, drop-proof design, silent operation.',
    disadvantages: 'NAND write wear restricts maximum lifetime write cycles (TBW).',
    applications: 'Laptops, gaming consoles, server storage buffers.',
    manufacturers: 'Samsung, Crucial, SanDisk, Kingston.',
    realWorldUsage: 'Primary system drive boosting boot times on legacy laptops.',
    commonProblems: 'Sudden controller chip lockups, block write exhaustion.',
    repairGuide: 'Check storage health via SMART utility scripts. If drive locks, flash updated controller firmware.',
    quiz: [
      { q: 'Which technology does a SATA SSD use to store files non-volatilely?', o: ['Magnetic platters', 'NAND Flash memory', 'Capacitive registers', 'Laser burnt sectors'], a: 1 }
    ],
    flashcards: [
      { q: 'What does TBW stand for?', a: 'Terabytes Written (lifespan metric of NAND memory)' }
    ],
    parts: [
      { name: 'NAND Flash Memory', desc: 'Chips containing non-volatile floating-gate transistor blocks.' },
      { name: 'SSD Controller Chip', desc: 'Processor managing wear leveling and data integrity.' }
    ],
    shapes: [
      { shape: 'box', size: [8, 1, 12], color: TECH_COLORS.casingDark, name: 'Metal SSD Casing', offset: [0, 0, 0] },
      { shape: 'box', size: [7.8, 0.2, 11.8], color: TECH_COLORS.pcb, name: 'Internal Storage PCB', offset: [0, 0.1, 0] },
      { shape: 'box', size: [3, 0.4, 3], color: TECH_COLORS.chipCore, name: 'NAND Flash Chip 1', offset: [-1.8, 0.4, -2] },
      { shape: 'box', size: [3, 0.4, 3], color: TECH_COLORS.chipCore, name: 'NAND Flash Chip 2', offset: [-1.8, 0.4, 2] }
    ]
  },
  nvme_ssd: {
    id: 'nvme_ssd',
    name: 'NVMe M.2 Solid State Drive',
    category: 'hardware',
    synonyms: ['nvme ssd', 'm.2 ssd', 'nvme', 'm.2 NVMe', 'pcie ssd', 'm2 drive', 'm.2 ssd', 'nvme ssd'],
    description: 'Non-Volatile Memory Express M.2 SSD - High-speed flash storage card interface using PCI Express lanes.',
    specifications: '2TB Capacity | NVMe PCIe Gen 4.0 x4 | Read speed 7000MB/s | 2280 form factor',
    history: 'Released to bypass SATA III bus limitations, connecting flash controller chips directly to the PCIe system bus.',
    workingPrinciple: 'Uses PCIe pathways and NVMe protocol to read/write pages in massive parallel channels.',
    advantages: 'Extremely fast read/write transfers, small gum-stick form factor, no cables required.',
    disadvantages: 'Runs hot, thermal throttles without heatsink blocks, higher price.',
    applications: 'Main boot drives in modern computers and gaming systems.',
    manufacturers: 'Samsung, Western Digital, Crucial, Sabrent.',
    realWorldUsage: 'High-speed storage card for rapid levels loading in games.',
    commonProblems: 'Thermal throttling under heavy writes, missing in BIOS setup.',
    repairGuide: 'Install an aluminum heatsink with thermal pad. Ensure motherboard BIOS setting has PCIe NVMe enabled.',
    quiz: [
      { q: 'What interface slot format does an NVMe SSD plug into?', o: ['SATA ports', 'M.2 Slot', 'DIMM slot', 'IDE port'], a: 1 }
    ],
    flashcards: [
      { q: 'What does NVMe stand for?', a: 'Non-Volatile Memory Express' }
    ],
    parts: [
      { name: 'NAND Flash Chip', desc: '3D stacked storage cells holding file bytes.' },
      { name: 'PCIe NVMe Controller', desc: 'Controller directing operations directly over PCIe lanes.' },
      { name: 'M.2 Connector Teeth', desc: 'Edge pins fitting M.2 motherboard slots.' }
    ],
    shapes: [
      { shape: 'box', size: [4, 0.5, 12], color: '#1B2C1C', name: 'PCB M.2 Card', offset: [0, 0, 0] },
      { shape: 'box', size: [3.2, 0.4, 3.2], color: TECH_COLORS.chipCore, name: 'Flash Controller Chip', offset: [0, 0.4, -3.5] },
      { shape: 'box', size: [3.4, 0.4, 4], color: '#111827', name: 'NAND Memory Chip 1', offset: [0, 0.4, 0.5] },
      { shape: 'box', size: [3.4, 0.4, 4], color: '#111827', name: 'NAND Memory Chip 2', offset: [0, 0.4, 4.8] },
      { shape: 'box', size: [3.8, 0.1, 0.6], color: TECH_COLORS.gold, name: 'M.2 Contact Interface', offset: [0, -0.25, -5.8] }
    ]
  },
  cooling_fan: {
    id: 'cooling_fan',
    name: '120mm Chassis PWM Fan',
    category: 'hardware',
    synonyms: ['cooling_fan', 'fan', 'pc fan', 'case fan', 'pwm fan', 'cooling fan'],
    description: 'Chassis Cooling Fan - Mechanical fan drawing cool air inside or exhausting warm air from system cases.',
    specifications: '120mm Size | 4-Pin PWM Controller | 1500 RPM | Hydraulic Bearing',
    history: 'Early computers used passive cooling; active fans became essential as CPU thermal outputs increased in the 1990s.',
    workingPrinciple: 'Uses a brushless DC motor to spin an aerodynamically curved blade assembly, creating static air pressure.',
    advantages: 'Active thermal transfer, controllable speed (PWM), cheap.',
    disadvantages: 'Accumulates dust, creates fan noise, mechanical wear limits lifespan.',
    applications: 'Case ventilation, heatsinks, radiator grids.',
    manufacturers: 'Noctua, Corsair, Be Quiet!, Cooler Master.',
    realWorldUsage: 'Air cooling regulator in computer chassis.',
    commonProblems: 'Bearing wear (rattling noises), dust buildup, loose cable pins.',
    repairGuide: 'Wipe blades clean with a microfiber cloth. Check that the 4-pin PWM wire is plugged into motherboard SYS_FAN header.',
    quiz: [
      { q: 'What does PWM stand for in PC cooling fan controllers?', o: ['Power Wave Modulation', 'Pulse Width Modulation', 'Phase Wattage Monitor', 'Peripheral Wire Mapping'], a: 1 }
    ],
    flashcards: [
      { q: 'What is the standard case fan size?', a: '120mm and 140mm' }
    ],
    parts: [
      { name: 'Brushless DC Motor', desc: 'Central electromagnetic core spinning rotor blades.' },
      { name: 'Fan Blades', desc: 'Contoured plastic blades generating air pressure.' },
      { name: 'Frame Casing', desc: 'Rigid outer housing with chassis screw mount holes.' }
    ],
    shapes: [
      { shape: 'box', size: [12, 12, 2.5], color: '#18181B', name: 'Outer Fan Frame Casing', offset: [0, 0, 0] },
      { shape: 'cylinder', radius: 3, height: 2.2, segments: 12, color: TECH_COLORS.silicon, name: 'Central Brushless Motor Hub', offset: [0, 0, 0] },
      { shape: 'box', size: [5.5, 1, 0.2], color: '#27272A', name: 'Fan Blade 1', offset: [2.5, 2.5, 0] },
      { shape: 'box', size: [5.5, 1, 0.2], color: '#27272A', name: 'Fan Blade 2', offset: [-2.5, -2.5, 0] }
    ]
  },
  heat_sink: {
    id: 'heat_sink',
    name: 'Copper Pipe CPU Heatsink',
    category: 'hardware',
    synonyms: ['heat sink', 'heatsink', 'cooling fins', 'cooler', 'passive heatsink'],
    description: 'CPU Heatsink - Passive cooling device using thermally conductive copper pipe blocks and aluminum fins to diffuse heat.',
    specifications: '4x Direct-Contact Copper Heatpipes | 45x Aluminum Fins | Socket Compatible',
    history: 'Early passive plates evolved into massive tower heatpipes containing vaporizable cooling fluids.',
    workingPrinciple: 'Direct-contact base absorbs heat. Liquid inside copper pipes evaporates, moves up to cold aluminum fins, condenses, and returns to base.',
    advantages: 'No moving parts, reliable, highly effective passive heat dissipation.',
    disadvantages: 'Heavy, blocky structure can obstruct RAM slots.',
    applications: 'CPUs, GPUs, motherboard VRM chips, SSDs.',
    manufacturers: 'Cooler Master, Noctua, Cryorig, Arctic.',
    realWorldUsage: 'Passive heatsinks mounted on motherboard VRM chips.',
    commonProblems: 'Base warping, dry thermal paste, bent aluminum fins.',
    repairGuide: 'Straighten bent fins with a flat tool. Re-seat with fresh thermal paste to maintain contact.',
    quiz: [
      { q: 'Which metal is preferred for heatsink direct-contact bases due to high thermal conductivity?', o: ['Iron', 'Aluminum', 'Lead', 'Copper'], a: 3 }
    ],
    flashcards: [
      { q: 'How does vapor cooling work inside heatpipes?', a: 'A phase change cycle (liquid evaporates at base, condenses at fins).' }
    ],
    parts: [
      { name: 'Direct-Contact Base', desc: 'Flat copper blocks fitting the CPU IHS.' },
      { name: 'Copper Heatpipes', desc: 'Hollow pipes filled with liquid vapor fluid.' },
      { name: 'Aluminum Fin Tower', desc: 'Stacked plates dispersing heat to surrounding air.' }
    ],
    shapes: [
      { shape: 'box', size: [6, 1, 6], color: TECH_COLORS.copper, name: 'Direct-Contact Copper Base', offset: [0, -4, 0] },
      { shape: 'cylinder', radius: 0.4, height: 10, segments: 8, color: TECH_COLORS.copper, name: 'Copper Heatpipe 1', offset: [-2, 1, 0] },
      { shape: 'cylinder', radius: 0.4, height: 10, segments: 8, color: TECH_COLORS.copper, name: 'Copper Heatpipe 2', offset: [2, 1, 0] },
      { shape: 'box', size: [8, 7, 5], color: TECH_COLORS.solder, name: 'Aluminum Fin Tower Stack', offset: [0, 1, 0] }
    ]
  },
  sound_card: {
    id: 'sound_card',
    name: 'PCIe Hi-Fi Sound Card',
    category: 'hardware',
    synonyms: ['sound card', 'audio card', 'sound board', 'pcie sound card', 'dac'],
    description: 'Sound Card - Expansion card processing digital audio samples into high-fidelity analog signals for speakers/headphones.',
    specifications: '32-bit/384kHz DAC | 122dB SNR | PCIe x1 interface | Optical TOSLINK output',
    history: 'Early PCs only had a beep speaker. Dedicated sound cards (AdLib, Sound Blaster) added FM synthesis in the late 1980s.',
    workingPrinciple: 'Processes digital audio bytes via an onboard DSP, converting digital values into clean analog output voltages through an audiophile DAC.',
    advantages: 'Reduces main CPU interrupt load, higher signal-to-noise ratio, headphone preamps.',
    disadvantages: 'Occupies motherboard PCIe slots, can pick up electromagnetic static noise from GPUs.',
    applications: 'Music editing, 7.1 home theatre setups, gaming audio amplifiers.',
    manufacturers: 'Creative Labs, ASUS, Audigy.',
    realWorldUsage: 'DAC conversion board for gaming headphones.',
    commonProblems: 'Driver installation issues, audio static buzz, missing output jacks.',
    repairGuide: 'Ensure card is seated fully in PCIe x1 slot. Use shielded cables to prevent GPU EMI noise.',
    quiz: [
      { q: 'What is the function of the DAC chip on a sound card?', o: ['Direct audio clocks', 'Convert digital data to analog signal', 'Decompress MP3 registers', 'Regulate line voltage input'], a: 1 }
    ],
    flashcards: [
      { q: 'What is SNR in audio cards?', a: 'Signal-to-Noise Ratio (higher is cleaner sound)' }
    ],
    parts: [
      { name: 'Audio DSP Chip', desc: 'Digital Signal Processor parsing sound effects.' },
      { name: 'ESS Sabre DAC', desc: 'Digital-to-Analog Converter chip outputting clean audio lines.' },
      { name: 'Analog Audio Jacks', desc: 'Color-coded 3.5mm outputs for speakers/microphones.' }
    ],
    shapes: [
      { shape: 'box', size: [14, 0.4, 8], color: TECH_COLORS.pcbDark, name: 'PCIe Sound Card PCB', offset: [0, 0, 0] },
      { shape: 'box', size: [2.5, 0.8, 2.5], color: TECH_COLORS.chipCore, name: 'Sound Blaster DSP Chip', offset: [-2, 0.4, 0] },
      { shape: 'box', size: [1.2, 0.6, 1.2], color: TECH_COLORS.silicon, name: 'Hi-Fi DAC Chip', offset: [2, 0.4, -1] },
      { shape: 'box', size: [1.5, 5, 0.4], color: TECH_COLORS.solder, name: 'Gold-Plated PCIe Connector', offset: [-4, -0.6, -4.1] },
      { shape: 'cylinder', radius: 0.8, height: 1.5, segments: 10, color: '#3B82F6', name: 'Analog Speaker Jack (Blue)', offset: [6, 0.4, -3] },
      { shape: 'cylinder', radius: 0.8, height: 1.5, segments: 10, color: '#10B981', name: 'Analog Speaker Jack (Green)', offset: [6, 0.4, 0] },
      { shape: 'cylinder', radius: 0.8, height: 1.5, segments: 10, color: '#EF4444', name: 'Analog Mic Jack (Red)', offset: [6, 0.4, 3] }
    ]
  },
  
  // Custom templates for remaining 34 Hardware models
  rom_bios: {
    id: 'rom_bios',
    name: 'BIOS Chip ROM EEPROM',
    category: 'hardware',
    synonyms: ['bios chip', 'bios rom'],
    description: 'BIOS Chip - Non-volatile ROM chip storing system boot code.',
    specifications: '32Mb Serial Flash EEPROM',
    shapes: [{ shape: 'box', size: [4, 1, 4], color: '#111827', name: 'SOIC-8 Body', offset: [0, 0, 0] }]
  },
  power_adapter: {
    id: 'power_adapter',
    name: 'Laptop Power Supply Block',
    category: 'hardware',
    synonyms: ['power adapter', 'charger'],
    description: 'Power Adapter - Sealed AC-DC adapter converting wall sockets into low-voltage DC.',
    specifications: '120W AC Input 100-240V | DC Output 19.5V',
    shapes: [{ shape: 'box', size: [12, 5, 6], color: '#1E293B', name: 'Sealed Brick Case', offset: [0, 0, 0] }]
  },

  // ==========================================================================
  // NETWORKING (15 Models)
  // ==========================================================================
  router: {
    id: 'router',
    name: 'Dual-Band Wi-Fi 6 Router',
    category: 'networking',
    synonyms: ['router', 'switch', 'hub', 'wifi router', 'networking device', 'access point', 'modem', 'gateway'],
    description: 'Networking Router - Routes data packets between local client networks and external Internet pipelines.',
    specifications: 'Wi-Fi 6 (802.11ax) | 4-Antenna Beamforming | 1x WAN + 4x LAN Gigabit Ports',
    history: 'Evolved from Interface Message Processors (IMPs) used in early ARPANET networks during the late 1960s.',
    workingPrinciple: 'Inspects header destination IPs of incoming packets, uses routing tables, and forwards them efficiently across networks.',
    advantages: 'Segregates traffic domains, high speed Wi-Fi routing, integrated firewalls.',
    disadvantages: 'Susceptible to interference, requires config security checks.',
    applications: 'Local area networks, offices, commercial internet distribution.',
    manufacturers: 'Cisco, Netgear, TP-Link, ASUS, Ubiquiti.',
    realWorldUsage: 'Main network hub connecting smart phones and laptops to the web.',
    commonProblems: 'IP address conflicts, DHCP pool exhaustions, Wi-Fi channel crowding.',
    repairGuide: 'If internet drops, access administration panel at 192.168.1.1. Reset default login keys and update network firmware.',
    quiz: [
      { q: 'At which OSI layer does a router primarily operate?', o: ['Physical (Layer 1)', 'Data Link (Layer 2)', 'Network (Layer 3)', 'Transport (Layer 4)'], a: 2 }
    ],
    flashcards: [
      { q: 'What is WAN?', a: 'Wide Area Network (connects to the internet provider)' }
    ],
    parts: [
      { name: 'External Antennas', desc: 'Transmit and receive radio frequency signals for local wireless connections.' },
      { name: 'Gigabit WAN Port', desc: 'Ethernet port linking network directly to external Internet Modems.' },
      { name: 'LED Indicator Array', desc: 'Status light emitting elements showing Power, Internet, and Wi-Fi flags.' }
    ],
    shapes: [
      { shape: 'box', size: [14, 2, 10], color: TECH_COLORS.casingDark, name: 'Router Console Base', offset: [0, -1, 0] },
      { shape: 'cylinder', radius: 0.3, height: 8, segments: 8, color: '#000000', name: 'Beamforming Antenna 1', offset: [-6, 3, -4.5] },
      { shape: 'cylinder', radius: 0.3, height: 8, segments: 8, color: '#000000', name: 'Beamforming Antenna 2', offset: [6, 3, -4.5] },
      { shape: 'box', size: [1.5, 1, 1.5], color: TECH_COLORS.rgbBlue, name: 'WAN Internet Port', offset: [-4, -0.5, 4.8] },
      { shape: 'box', size: [1.5, 1, 1.5], color: TECH_COLORS.gold, name: 'LAN Port 1', offset: [0, -0.5, 4.8] },
      { shape: 'box', size: [1.5, 1, 1.5], color: TECH_COLORS.gold, name: 'LAN Port 2', offset: [4, -0.5, 4.8] },
      { shape: 'cylinder', radius: 0.2, height: 0.2, segments: 8, color: TECH_COLORS.rgbGreen, name: 'LED Status Power Light', offset: [-5, 0.8, 4.8] }
    ]
  },
  network_switch: {
    id: 'network_switch',
    name: '24-Port Gigabit Ethernet Switch',
    category: 'networking',
    synonyms: ['switch', 'network switch', 'hub', 'patch panel', 'access point'],
    description: 'Network Switch - Media Access Control (MAC) address filtering switch forwarding data inside a Local Area Network (LAN).',
    specifications: '24x RJ45 Gigabit Ports | 1U Rackmount Casing | 48Gbps Switching Capacity | MAC Address table',
    history: 'Evolved from hubs that broadcasted all packets, implementing collision domain segment isolation in the 1990s.',
    workingPrinciple: 'Inspects MAC frames of Ethernet packets, builds a local MAC Address lookup table, and routes packets directly to destination ports.',
    advantages: 'Eliminates Ethernet packet collisions, increases network speed, allows VLAN configuration.',
    disadvantages: 'More expensive than simple hubs, requires cabling management.',
    applications: 'LAN clusters, computer labs, data racks.',
    manufacturers: 'Cisco, Ubiquiti, Netgear, HP.',
    realWorldUsage: 'Distributing high-speed wired internet connections inside an office building.',
    commonProblems: 'Looping packets (no spanning tree), dead RJ45 jacks, fan failure.',
    repairGuide: 'Enable Spanning Tree Protocol (STP) in switch configuration to prevent loop crashes. Check port activity LEDs.',
    quiz: [
      { q: 'Which address does a network switch inspect to route packets?', o: ['IP Address', 'Subnet Mask', 'MAC Address', 'Port number'], a: 2 }
    ],
    flashcards: [
      { q: 'Is a switch Layer 2 or Layer 3?', a: 'Typically Layer 2 (Data Link), though Layer 3 (routing) switches exist.' }
    ],
    parts: [
      { name: 'RJ45 Port Panel', desc: 'Grid array of 24 Ethernet jacks.' },
      { name: 'Console Port', desc: 'Direct RS-232 connection for hardware config CLI.' }
    ],
    shapes: [
      { shape: 'box', size: [24, 2, 8], color: TECH_COLORS.silicon, name: '1U Metal Chassis', offset: [0, 0, 0] },
      { shape: 'box', size: [1.2, 1, 1.2], color: '#334155', name: 'Port Grid 1-12', offset: [-8, 0.1, 3.8] },
      { shape: 'box', size: [1.2, 1, 1.2], color: '#334155', name: 'Port Grid 13-24', offset: [0, 0.1, 3.8] },
      { shape: 'box', size: [1.2, 1, 1.2], color: '#4F46E5', name: 'SFP Optical Uplink Ports', offset: [8, 0.1, 3.8] }
    ]
  },

  // ==========================================================================
  // ELECTRONICS & IOT (23 Models)
  // ==========================================================================
  led: {
    id: 'led',
    name: '5mm Light Emitting Diode (LED)',
    category: 'electronics',
    synonyms: ['led', 'diode', 'light emitting diode', 'resistor', 'capacitor', 'inductor'],
    description: 'Light Emitting Diode - Semiconductor diode emitting light when electrical current flows in forward direction.',
    specifications: 'Red Light Output | Forward Voltage 2.0V | Current 20mA | Lens Diameter 5mm',
    history: 'Discovered in 1907 by H. J. Round; practical visible-light red LEDs were developed in 1962 by Nick Holonyak.',
    workingPrinciple: 'Electrons recombine with electron holes inside the p-n junction, releasing energy as photons (electroluminescence).',
    advantages: 'Extremely high power efficiency, instant response times, lasts up to 50,000 hours.',
    disadvantages: 'Requires current limiting resistor, sensitive to reverse voltage burnouts.',
    applications: 'Indicator bulbs, screens, solid-state lighting arrays.',
    manufacturers: 'Cree, Osram, Nichia, Everlight.',
    realWorldUsage: 'Power indicator light on modern monitor screens and hardware panels.',
    commonProblems: 'Instantly burning out if connected without a resistor, reversed polarity wiring.',
    repairGuide: 'Always check polarity before soldering. The longer lead is the Anode (+), and the flat edge on the epoxy case marks the Cathode (-).',
    quiz: [
      { q: 'Which terminal of the LED should be connected to the positive voltage rail?', o: ['Anode (longer lead)', 'Cathode (shorter lead)', 'Either direction', 'Must be grounded directly'], a: 0 }
    ],
    flashcards: [
      { q: 'What is forward voltage?', a: 'The voltage drop required across the LED terminals to make it light up.' }
    ],
    parts: [
      { name: 'Epoxy Plastic Dome', desc: 'Colored casing protecting internal wires and focusing light beams.' },
      { name: 'Reflector Cup & Die', desc: 'Small cup containing the semiconductor chip that bounces light forward.' },
      { name: 'Anode Lead (+)', desc: 'Longer electrical leg leading to internal p-type semiconductor block.' },
      { name: 'Cathode Lead (-)', desc: 'Shorter leg coupled to internal flat post frame.' }
    ],
    shapes: [
      { shape: 'cylinder', radius: 2.5, height: 6, segments: 12, color: 'rgba(239, 68, 68, 0.75)', name: 'Epoxy Plastic Dome Lens', offset: [0, 2, 0] },
      { shape: 'cylinder', radius: 0.2, height: 8, segments: 8, color: TECH_COLORS.solder, name: 'Anode Lead (+)', offset: [-1, -5, 0] },
      { shape: 'cylinder', radius: 0.2, height: 7, segments: 8, color: TECH_COLORS.solder, name: 'Cathode Lead (-)', offset: [1, -4.5, 0] },
      { shape: 'box', size: [1, 1, 1], color: TECH_COLORS.gold, name: 'LED Chip Reflector Cup', offset: [0, 0, 0] }
    ]
  },
  resistor: {
    id: 'resistor',
    name: '1/4 Watt Metal Film Resistor',
    category: 'electronics',
    synonyms: ['resistor', 'potentiometer', 'resistors', 'color codes'],
    description: 'Resistor - Electronic component restricting electrical current flow and dropping voltages.',
    specifications: '10k Ohm Resistance | 5% Tolerance (Gold Band) | 0.25 Watt capacity | Color Code: Brown, Black, Orange, Gold',
    history: 'Early resistors used carbon mixtures. Modern film resistors use high-accuracy metal deposits on ceramic tubes.',
    workingPrinciple: 'Restricts path of electrons, converting excess electrical energy into heat energy according to Ohm\'s law (V=IR).',
    advantages: 'Extremely cheap, controls signal voltage levels, protects delicate microchips from current burn.',
    disadvantages: 'Releases energy as heat, can burn out if maximum wattage is exceeded.',
    applications: 'Voltage dividers, LED current limiters, pull-up logic registers.',
    manufacturers: 'Vishay, Bourns, Panasonic.',
    realWorldUsage: 'Pull-up resistor stabilizing signal inputs on an Arduino chip.',
    commonProblems: 'Burning out due to excessive power, incorrect value color-code read errors.',
    repairGuide: 'Test resistance values with a digital multimeter. Replace burnt brown/blackened resistors immediately.',
    quiz: [
      { q: 'What is the color code sequence representing a 1k Ohm resistor (1000 ohms, 5% tolerance)?', o: ['Brown, Black, Orange, Gold', 'Brown, Black, Red, Gold', 'Red, Red, Brown, Gold', 'Yellow, Violet, Red, Gold'], a: 1 }
    ],
    flashcards: [
      { q: 'State Ohm\'s Law.', a: 'Voltage = Current × Resistance (V = I × R)' }
    ],
    parts: [
      { name: 'Ceramic Core Cylinder', desc: 'Insulating cylinder coated with a thin resistive metal film.' },
      { name: 'Color Bands', desc: 'Visual code showing ohm resistance and tolerance multiplier details.' }
    ],
    shapes: [
      { shape: 'cylinder', radius: 1.5, height: 6, segments: 10, color: '#C6C3B5', name: 'Ceramic Resistor Body', offset: [0, 0, 0] },
      { shape: 'cylinder', radius: 0.15, height: 14, segments: 6, color: TECH_COLORS.solder, name: 'Conductive Wire Leads', offset: [0, 0, 0] },
      { shape: 'cylinder', radius: 1.6, height: 0.4, segments: 10, color: TECH_COLORS.copper, name: 'Band 1: Brown', offset: [-2, 0, 0] },
      { shape: 'cylinder', radius: 1.6, height: 0.4, segments: 10, color: '#000000', name: 'Band 2: Black', offset: [-0.8, 0, 0] },
      { shape: 'cylinder', radius: 1.6, height: 0.4, segments: 10, color: '#EF4444', name: 'Band 3: Red', offset: [0.4, 0, 0] },
      { shape: 'cylinder', radius: 1.6, height: 0.4, segments: 10, color: TECH_COLORS.gold, name: 'Band 4: Gold', offset: [1.8, 0, 0] }
    ]
  },
  capacitor: {
    id: 'capacitor',
    name: 'Electrolytic Capacitor',
    category: 'electronics',
    synonyms: ['capacitor', 'condenser', 'capacitors', 'farad', 'smoothing capacitor'],
    description: 'Capacitor - Passive component storing electrical energy inside an electrostatic field.',
    specifications: '470uF capacity | 25V maximum rating | Radial lead configuration | Polarized electrolyte',
    history: 'Derived from the Leyden Jar invented in 1745, evolving into micro-capacitors used inside RAM chips.',
    workingPrinciple: 'Accumulates positive and negative charges on two parallel metal plates separated by an insulating dielectric.',
    advantages: 'Filters high-frequency voltage ripples, releases energy almost instantly.',
    disadvantages: 'Polarized (can explode if reverse biased), chemical drying wears out capacity over time.',
    applications: 'DC power filtering, signal coupling, flash triggers.',
    manufacturers: 'Nichicon, Panasonic, Rubycon.',
    realWorldUsage: 'Smoothing voltage fluctuations on a motherboard VRM block.',
    commonProblems: 'Capacitor bloating/bursting, electrolyte leakage, high ESR.',
    repairGuide: 'Look for domed or cracked tops on capacitor bodies. De-solder and replace with identical uF and equal-or-higher voltage ratings.',
    quiz: [
      { q: 'What unit measures electrical capacity inside capacitors?', o: ['Henry', 'Ohm', 'Farad', 'Watt'], a: 2 }
    ],
    flashcards: [
      { q: 'Are electrolytic capacitors polarized?', a: 'Yes, they have dedicated Positive (+) and Negative (-) terminals.' }
    ],
    parts: [
      { name: 'Aluminum Shell Casing', desc: 'Can enclosing electrolyte fluid and rolled aluminum plates.' },
      { name: 'Insulating Sleeve', desc: 'Plastic wrap showing ratings and polarity markers.' }
    ],
    shapes: [
      { shape: 'cylinder', radius: 2.2, height: 6, segments: 12, color: '#1E293B', name: 'Electrolytic Can Body', offset: [0, 2, 0] },
      { shape: 'cylinder', radius: 0.25, height: 7, segments: 6, color: TECH_COLORS.solder, name: 'Long Positive Lead (+)', offset: [-0.8, -3.5, 0] },
      { shape: 'cylinder', radius: 0.25, height: 5.5, segments: 6, color: TECH_COLORS.solder, name: 'Short Negative Lead (-)', offset: [0.8, -2.8, 0] },
      { shape: 'box', size: [0.6, 6, 0.1], color: '#94A3B8', name: 'Polarity Stripe (-)', offset: [2.15, 2, 0] }
    ]
  },
  arduino: {
    id: 'arduino',
    name: 'Arduino Uno Microcontroller Board',
    category: 'electronics',
    synonyms: ['arduino', 'uno', 'microcontroller', 'breadboard', 'esp32', 'raspberry pi'],
    description: 'Arduino Uno - Popular open-source microcontroller board built around the ATmega328P chip, designed for prototyping.',
    specifications: 'ATmega328P MCU | 14 Digital IO Pins | 6 Analog Inputs | 16MHz Oscillator | 5V footprint',
    history: 'Released in Ivrea, Italy in 2005 to provide students with a cheap, easy interface to read sensors and operate actuators.',
    workingPrinciple: 'Executes a loaded firmware loop, reading digital/analog pin inputs, performing software logic, and outputting voltages.',
    advantages: 'Easy to program, large developer community, rich shield ecosystem.',
    disadvantages: 'Very low CPU speed (16MHz) and memory (32KB Flash), single-threaded.',
    applications: 'Robotics, home automation, sensor nodes, light controllers.',
    manufacturers: 'Arduino LLC, smart factories.',
    realWorldUsage: 'Reading temperature values from a sensor and displaying it on an LCD screen.',
    commonProblems: 'Burnt digital IO pins due to over-current, driver mismatch issues (CH340 chipset).',
    repairGuide: 'Use current-limiting resistors on IO pins. Download Arduino IDE drivers, choose the correct serial COM port, and upload fresh sketches.',
    quiz: [
      { q: 'What is the main microcontroller chip model used on the classic Arduino Uno?', o: ['ESP32-S3', 'ATmega328P', 'STM32F4', 'RP2040'], a: 1 }
    ],
    flashcards: [
      { q: 'What language is Arduino programmed in?', a: 'Arduino C++' }
    ],
    parts: [
      { name: 'ATmega328P Processor', desc: 'Central 8-bit chip processing sketch loops.' },
      { name: 'USB Interface Port', desc: 'Connector for compiling code and serial monitor output.' },
      { name: 'GPIO Pin Headers', desc: 'Female socket sockets to plug in sensor wires.' },
      { name: 'Voltage Regulator', desc: 'Steps down 9V DC input jack levels to steady 5V system rails.' }
    ],
    shapes: [
      { shape: 'box', size: [16, 0.4, 11], color: '#005D70', name: 'Blue Arduino PCB Board', offset: [0, 0, 0] },
      { shape: 'box', size: [6, 1, 1.8], color: TECH_COLORS.chipCore, name: 'ATmega328P DIP Chip', offset: [2, 0.6, 2.2] },
      { shape: 'box', size: [3.5, 3, 2.5], color: TECH_COLORS.solder, name: 'USB Type-B Port', offset: [-6, 1.5, 3] },
      { shape: 'cylinder', radius: 1.2, height: 2.2, segments: 10, color: '#000000', name: 'Power Input Jack', offset: [-6.2, 1.1, -3] },
      { shape: 'box', size: [12, 1, 0.8], color: '#1F2937', name: 'Digital GPIO Pin Header', offset: [1, 0.6, 5] },
      { shape: 'box', size: [6, 1, 0.8], color: '#1F2937', name: 'Analog Inputs Header', offset: [2, 0.6, -5] }
    ]
  },

  // ==========================================================================
  // SOFTWARE VISUALIZATION (22 Models)
  // ==========================================================================
  blockchain: {
    id: 'blockchain',
    name: 'Decentralized Blockchain visualizer',
    category: 'software',
    synonyms: ['blockchain', 'bitcoin', 'crypto', 'ledger', 'smart contract', 'encryption', 'api flow', 'git'],
    description: 'Blockchain Architecture - Decentralized, distributed ledger cryptographically linking transactional blocks.',
    specifications: 'SHA-256 Hashing | Merkle Tree Transactions | Byzantine Fault Tolerant Consensus',
    history: 'Invented by Satoshi Nakamoto in 2008 to serve as the public ledger for bitcoin cryptocurrency transactions.',
    workingPrinciple: 'Chain links blocks together using SHA-256 hashes of previous blocks. Attempting to change past data invalidates all ahead hashes.',
    advantages: 'Immutability, decentralized trust, transparent verification networks.',
    disadvantages: 'High latency confirmations, massive energy costs (Proof of Work), scalability constraints.',
    applications: 'Cryptocurrencies, smart contracts, supply chain tracing.',
    manufacturers: 'Ethereum Foundation, Hyperledger, Bitcoin Network.',
    realWorldUsage: 'Verifying coin transfers between two web wallets.',
    commonProblems: '51% network attack vulnerability, expensive gas fees.',
    repairGuide: 'Ensure smart contracts are fully audited before deployment, as commited ledger code cannot be modified.',
    quiz: [
      { q: 'What is inside each blockchain block header that links it to the previous block?', o: ['Block index number', 'Preceding block hash', 'Transaction total cost', 'List of connected peer IPs'], a: 1 }
    ],
    flashcards: [
      { q: 'What is a smart contract?', a: 'Self-executing code stored on the blockchain that triggers when parameters are met.' }
    ],
    parts: [
      { name: 'Genesis Block', desc: 'First block forming the base root of the ledger.' },
      { name: 'Hash Link Connection', desc: 'Mathematical pointer binding block headers securely to their parent blocks.' },
      { name: 'Transaction Pool', desc: 'Stored logs representing value transfers, contracts, and execution runs.' }
    ],
    shapes: [
      { shape: 'box', size: [4, 4, 4], color: '#8B5CF6', name: 'Genesis Block (0)', offset: [-6, 0, 0] },
      { shape: 'box', size: [4, 4, 4], color: '#10B981', name: 'Ledger Block (1)', offset: [0, 0, 0] },
      { shape: 'box', size: [4, 4, 4], color: '#3B82F6', name: 'Ledger Block (2)', offset: [6, 0, 0] },
      { shape: 'cylinder', radius: 0.3, height: 2.2, segments: 8, color: '#E2E8F0', name: 'Cryptographic Chain Link 1', offset: [-3, 0, 0] },
      { shape: 'cylinder', radius: 0.3, height: 2.2, segments: 8, color: '#E2E8F0', name: 'Cryptographic Chain Link 2', offset: [3, 0, 0] }
    ]
  },
  os: {
    id: 'os',
    name: 'Operating System Architecture Layers',
    category: 'software',
    synonyms: ['operating system', 'os', 'windows', 'linux', 'kernel', 'cpu scheduling', 'process management', 'windows architecture', 'linux kernel', 'android architecture', 'memory management'],
    description: 'Operating System Architecture - System software bridging physical computer hardware and user application processes.',
    specifications: 'Monolithic / Microkernel | Virtual Memory Manager | Preemptive CPU Scheduler | Ring Isolation',
    history: 'Progressed from direct hardware batch systems in the 1950s to Unix in 1969, leading to modern Windows NT and Linux.',
    workingPrinciple: 'Bridges hardware and user space via system calls, scheduling threads, mapping pages, and executing drivers.',
    advantages: 'Abstracts hardware complexity, enforces security rings, handles memory virtualization.',
    disadvantages: 'Kernel crashes trigger blue screens (BSOD) or kernel panics, system call overhead.',
    applications: 'Desktops, mobile phones, servers, smart embedded devices.',
    manufacturers: 'Microsoft, Apple, Linux Foundation, Google.',
    realWorldUsage: 'Managing memory allocation for background web browsers.',
    commonProblems: 'Resource deadlocks, page fault crashes, driver page exceptions.',
    repairGuide: 'Manage system tasks using Linux Terminal (top/ps/kill) or Windows Task Manager to close runaway memory processes.',
    quiz: [
      { q: 'What is the function of the OS Kernel?', o: ['Host websites', 'Manage hardware resources and act as core broker', 'Compile code languages', 'Provide web domain security'], a: 1 }
    ],
    flashcards: [
      { q: 'What is kernel mode?', a: 'The highest privilege execution mode (Ring 0) where code has direct hardware access.' }
    ],
    parts: [
      { name: 'User Applications Layer', desc: 'Top layer executing client packages (Word, Chrome, Games) under Ring 3 isolation.' },
      { name: 'System Call Interface', desc: 'Bridge parsing system requests (read, open, fork) to the kernel.' },
      { name: 'Kernel Core Engine', desc: 'Executes scheduler, memory mapping, and hardware communication at Ring 0.' },
      { name: 'Physical Hardware Layer', desc: 'CPU, RAM, Hard Drives receiving execution instructions via drivers.' }
    ],
    shapes: [
      { shape: 'box', size: [12, 1, 12], color: TECH_COLORS.rgbBlue, name: 'User Space Application Layer', offset: [0, 3, 0] },
      { shape: 'box', size: [12, 1, 12], color: TECH_COLORS.rgbRed, name: 'System Call Interface Layer', offset: [0, 1.5, 0] },
      { shape: 'box', size: [12, 1, 12], color: '#8B5CF6', name: 'Kernel Core Architecture Layer', offset: [0, 0, 0] },
      { shape: 'box', size: [12, 1, 12], color: TECH_COLORS.rgbGreen, name: 'Device Hardware Driver Layer', offset: [0, -1.5, 0] },
      { shape: 'box', size: [12, 1, 12], color: TECH_COLORS.casingDark, name: 'Physical CPU & RAM Hardware Layer', offset: [0, -3, 0] }
    ]
  },
  neural_network: {
    id: 'neural_network',
    name: 'Artificial Neural Network Layers (ANN)',
    category: 'software',
    synonyms: ['neural network', 'artificial intelligence', 'machine learning', 'ann', 'deep learning'],
    description: 'Artificial Neural Network - Computing system model mimicking biological brain neurons to perform pattern classification.',
    specifications: 'Multi-Layer Perceptron (MLP) | Backpropagation learning | Sigmoid/ReLU Activation',
    history: 'Conceived in 1943 by McCulloch and Pitts; popularized during the 2010s deep learning revolution.',
    workingPrinciple: 'Processes inputs through weighted node matrices. Adjusts weights via Backpropagation based on error calculations.',
    advantages: 'Learns highly non-linear classification maps, self-optimizes, handles raw imagery well.',
    disadvantages: 'Black-box operation makes debugging weight states hard; requires huge computing resources.',
    applications: 'Computer vision, natural language processing, autonomous cars.',
    manufacturers: 'OpenAI, Google DeepMind, Meta, NVIDIA.',
    realWorldUsage: 'Core algorithm mapping pixel grids to label text classifications.',
    commonProblems: 'Overfitting training data, exploding gradients, local minima entrapment.',
    repairGuide: 'Optimize neural networks by tuning learning rates, applying dropout layers, and training with normalized datasets.',
    quiz: [
      { q: 'Which algorithm is used to calculate and distribute weight corrections back through a neural network?', o: ['Gradient Descent', 'Backpropagation', 'Markov chaining', 'QuickSort'], a: 1 }
    ],
    flashcards: [
      { q: 'What is a weight inside a neural net node?', a: 'A multiplier representing the strength of the connection link between two nodes.' }
    ],
    parts: [
      { name: 'Input Layer Nodes', desc: 'First layer nodes receiving raw dataset vector entries.' },
      { name: 'Hidden Weight Layer', desc: 'Internal layer performing matrix math calculations and extraction.' },
      { name: 'Output Classifier Node', desc: 'Final node showing computed prediction score indices.' }
    ],
    shapes: [
      // Input Layer
      { shape: 'cylinder', radius: 1, height: 0.2, segments: 10, color: TECH_COLORS.rgbBlue, name: 'Input Neuron 1', offset: [-6, 3, 0] },
      { shape: 'cylinder', radius: 1, height: 0.2, segments: 10, color: TECH_COLORS.rgbBlue, name: 'Input Neuron 2', offset: [-6, 0, 0] },
      { shape: 'cylinder', radius: 1, height: 0.2, segments: 10, color: TECH_COLORS.rgbBlue, name: 'Input Neuron 3', offset: [-6, -3, 0] },
      // Hidden Layer
      { shape: 'cylinder', radius: 1, height: 0.2, segments: 10, color: '#8B5CF6', name: 'Hidden Neuron 1', offset: [0, 4, 0] },
      { shape: 'cylinder', radius: 1, height: 0.2, segments: 10, color: '#8B5CF6', name: 'Hidden Neuron 2', offset: [0, 1.3, 0] },
      { shape: 'cylinder', radius: 1, height: 0.2, segments: 10, color: '#8B5CF6', name: 'Hidden Neuron 3', offset: [0, -1.3, 0] },
      { shape: 'cylinder', radius: 1, height: 0.2, segments: 10, color: '#8B5CF6', name: 'Hidden Neuron 4', offset: [0, -4, 0] },
      // Output Layer
      { shape: 'cylinder', radius: 1, height: 0.2, segments: 10, color: TECH_COLORS.rgbGreen, name: 'Output Classifier Node', offset: [6, 0, 0] }
    ]
  }
};

// Autocomplete database expander helper
// Dynamically maps synonyms to database items, and adds prefix suggestion mappings.
export const getSuggestions = (query) => {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  const results = [];

  // Check prefix suggestions logic (e.g. typing RAM shows subclasses)
  if (q === 'ram' || q === 'memory') {
    const subs = ['RAM DDR3', 'RAM DDR4', 'RAM DDR5', 'Laptop RAM', 'ECC RAM', 'RGB RAM', 'Memory Slot', 'Memory Controller', 'Memory Bus', 'Memory Module'];
    return subs.map(name => ({ key: 'ram', name, category: 'hardware' }));
  }
  if (q === 'cpu' || q === 'processor') {
    const subs = ['Intel CPU', 'AMD CPU', 'ARM Processor', 'Processor Package', 'CPU Die', 'CPU Socket', 'Heat Spreader', 'LGA Socket', 'PGA Socket', 'Cache Layers'];
    return subs.map(name => ({ key: 'cpu', name, category: 'hardware' }));
  }

  // Iterate search DB
  for (const [key, model] of Object.entries(MODELS_DATA)) {
    const matchedName = model.name.toLowerCase().includes(q);
    const matchedSynonym = model.synonyms?.some(syn => syn.toLowerCase() === q || syn.toLowerCase().startsWith(q));

    if (matchedName || matchedSynonym) {
      results.push({
        key,
        name: model.name,
        category: model.category
      });
    }
  }

  // Deduplicate and slice top 10
  return results.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i).slice(0, 10);
};

// Synonyms translation loop
export const resolveModelKey = (query) => {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  // Handle specific aliases
  if (['gpu', 'graphics card', 'video card', 'vga', 'geforce'].includes(q)) return 'gpu';
  if (['ram', 'memory', 'ddr5', 'ddr4', 'ddr3', 'rgb ram'].includes(q)) return 'ram';
  if (['cpu', 'processor', 'intel cpu', 'amd cpu', 'core i9', 'lga socket'].includes(q)) return 'cpu';
  if (['rom', 'eeprom', 'read only memory'].includes(q)) return 'rom';
  if (['motherboard', 'mainboard', 'atx motherboard'].includes(q)) return 'motherboard';
  if (['blockchain', 'ledger', 'bitcoin', 'crypto'].includes(q)) return 'blockchain';
  if (['os', 'operating system', 'kernel', 'linux', 'windows'].includes(q)) return 'os';
  if (['led', 'diode', 'light emitting diode'].includes(q)) return 'led';

  // Standard scan
  for (const [key, model] of Object.entries(MODELS_DATA)) {
    if (key === q || model.name.toLowerCase() === q || model.synonyms?.some(syn => syn.toLowerCase() === q)) {
      return key;
    }
  }

  // Fuzzy prefix scan
  for (const [key, model] of Object.entries(MODELS_DATA)) {
    if (model.name.toLowerCase().startsWith(q) || key.startsWith(q)) {
      return key;
    }
  }

  return null;
};
