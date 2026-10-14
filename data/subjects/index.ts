// ─── E&TC Subject Data Layer ──────────────────────────────────────────────────
// Structured dataset for all 24 E&TC subjects.
// Each subject contains: topics, subtopics, keywords, difficulty mapping,
// expected skills, and reference concepts used by the AI question generator.

export interface SubjectTopic {
  name: string;
  subtopics: string[];
  keywords: string[];
}

export interface ETCSubjectData {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  category: "core" | "applied" | "software" | "advanced";
  topics: SubjectTopic[];
  expectedSkills: string[];
  referenceConcepts: string[];
  difficultyMapping: {
    beginner: string[];
    placement: string[];
    gate: string[];
  };
}

export const ETC_SUBJECTS: ETCSubjectData[] = [
  // ── CORE ELECTRONICS ──────────────────────────────────────────────────────
  {
    id: "analog-electronics",
    name: "Analog Electronics",
    icon: "⚡",
    color: "#ef4444",
    description: "Diodes, BJTs, MOSFETs, op-amps, amplifiers, and analog circuits",
    category: "core",
    topics: [
      {
        name: "Diodes and Rectifiers",
        subtopics: ["PN Junction", "Zener diode", "Schottky diode", "Half-wave rectifier", "Full-wave rectifier", "Bridge rectifier", "Clippers & clampers"],
        keywords: ["forward bias", "reverse bias", "barrier potential", "ripple factor", "PIV", "dynamic resistance"],
      },
      {
        name: "Bipolar Junction Transistor (BJT)",
        subtopics: ["NPN/PNP types", "CE/CB/CC configurations", "DC biasing", "Q-point", "Small signal model", "h-parameter model", "Amplifier gain"],
        keywords: ["base current", "collector current", "beta (hFE)", "transconductance", "voltage divider bias", "emitter degeneration"],
      },
      {
        name: "FET and MOSFET",
        subtopics: ["JFET characteristics", "MOSFET enhancement/depletion modes", "CMOS basics", "FET biasing", "FET amplifiers", "CS/CD/CG configurations"],
        keywords: ["pinch-off voltage", "threshold voltage", "drain current", "channel resistance", "body effect"],
      },
      {
        name: "Operational Amplifiers",
        subtopics: ["Ideal vs real op-amp", "Inverting amplifier", "Non-inverting amplifier", "Summing amplifier", "Differential amplifier", "Integrator", "Differentiator", "Comparator"],
        keywords: ["virtual ground", "open loop gain", "CMRR", "slew rate", "offset voltage", "gain-bandwidth product"],
      },
      {
        name: "Oscillators and Power Amplifiers",
        subtopics: ["Barkhausen criterion", "Colpitts oscillator", "Hartley oscillator", "Crystal oscillator", "Class A/B/C/D amplifiers", "Push-pull amplifier"],
        keywords: ["feedback fraction", "loop gain", "efficiency", "distortion", "crossover distortion"],
      },
    ],
    expectedSkills: ["Circuit analysis", "Biasing design", "Frequency response", "Small signal modeling", "PCB-level troubleshooting"],
    referenceConcepts: ["Thevenin/Norton theorem", "KVL/KCL", "AC/DC load line", "Bode plot", "Nyquist stability"],
    difficultyMapping: {
      beginner: ["Diode working", "BJT configurations", "Op-amp ideal characteristics"],
      placement: ["BJT biasing design", "Op-amp circuit analysis", "MOSFET characteristics", "Amplifier gain calculation"],
      gate: ["Small signal models", "Stability analysis", "Feedback amplifier theory", "Frequency compensation"],
    },
  },
  {
    id: "digital-electronics",
    name: "Digital Electronics",
    icon: "🔢",
    color: "#8b5cf6",
    description: "Logic gates, Boolean algebra, combinational and sequential circuits",
    category: "core",
    topics: [
      {
        name: "Number Systems and Boolean Algebra",
        subtopics: ["Binary, Octal, Hexadecimal", "Conversions", "Boolean laws", "De Morgan's theorems", "SOP and POS", "Canonical forms"],
        keywords: ["minterm", "maxterm", "complement", "dual", "universal gates"],
      },
      {
        name: "Karnaugh Maps",
        subtopics: ["2/3/4/5 variable K-maps", "Grouping rules", "Essential prime implicants", "Don't care conditions", "Minimization"],
        keywords: ["prime implicant", "essential prime implicant", "two's complement", "gray code"],
      },
      {
        name: "Combinational Circuits",
        subtopics: ["Half adder/Full adder", "Subtractor", "Multiplexer", "Demultiplexer", "Encoder/Decoder", "Priority encoder", "BCD to 7-segment"],
        keywords: ["propagation delay", "fan-in", "fan-out", "hazard", "race condition"],
      },
      {
        name: "Sequential Circuits",
        subtopics: ["SR latch/flip-flop", "D flip-flop", "JK flip-flop", "T flip-flop", "Master-slave FF", "Ripple counter", "Synchronous counter", "Shift register"],
        keywords: ["setup time", "hold time", "clock skew", "metastability", "state machine"],
      },
      {
        name: "Finite State Machines",
        subtopics: ["Mealy machine", "Moore machine", "State diagram", "State table", "State minimization", "State encoding"],
        keywords: ["state transition", "next state logic", "output logic", "sequence detector"],
      },
    ],
    expectedSkills: ["Boolean simplification", "K-map minimization", "Circuit design from truth table", "Sequential circuit analysis"],
    referenceConcepts: ["Boolean algebra", "Logic families (TTL/CMOS)", "Timing diagrams", "Propagation delay"],
    difficultyMapping: {
      beginner: ["Logic gates truth tables", "Boolean identities", "Basic combinational circuits"],
      placement: ["K-map minimization", "Counter design", "Multiplexer applications", "FSM design"],
      gate: ["Hazard elimination", "Asynchronous sequential circuits", "PLDs", "Multi-level minimization"],
    },
  },
  {
    id: "signals-systems",
    name: "Signals & Systems",
    icon: "〰️",
    color: "#06b6d4",
    description: "Signal analysis, Fourier, Laplace, Z-transforms and LTI systems",
    category: "core",
    topics: [
      {
        name: "Signals and Classification",
        subtopics: ["Continuous vs discrete", "Periodic vs aperiodic", "Energy vs power signals", "Deterministic vs random", "Causal vs non-causal", "Even/odd signals"],
        keywords: ["unit step", "impulse function", "ramp signal", "sinc function", "signum function"],
      },
      {
        name: "LTI Systems",
        subtopics: ["Linearity", "Time-invariance", "Causality", "Stability (BIBO)", "Impulse response", "Convolution integral", "Step response"],
        keywords: ["convolution", "superposition", "memory", "invertibility", "transfer function"],
      },
      {
        name: "Fourier Analysis",
        subtopics: ["Fourier series (trigonometric/exponential)", "Fourier transform", "DTFT", "Properties", "Parseval's theorem", "Convolution theorem"],
        keywords: ["spectrum", "bandwidth", "magnitude spectrum", "phase spectrum", "Dirichlet conditions"],
      },
      {
        name: "Laplace Transform",
        subtopics: ["Definition", "Region of convergence", "Properties", "Partial fraction expansion", "Inverse Laplace", "Circuit analysis using Laplace"],
        keywords: ["s-domain", "poles and zeros", "ROC", "initial/final value theorem"],
      },
      {
        name: "Z-Transform",
        subtopics: ["Definition", "ROC", "Properties", "Inverse Z-transform", "DT system analysis", "Relationship with DTFT"],
        keywords: ["z-plane", "unit circle", "poles", "zeros", "stability in z-domain"],
      },
      {
        name: "Sampling Theory",
        subtopics: ["Nyquist theorem", "Aliasing", "Reconstruction", "Anti-aliasing filter", "Quantization", "Oversampling"],
        keywords: ["sampling frequency", "Nyquist rate", "folding frequency", "sinc interpolation"],
      },
    ],
    expectedSkills: ["Signal classification", "Fourier analysis", "Convolution", "System stability analysis", "Transform-domain circuit analysis"],
    referenceConcepts: ["Eigenfunction property", "BIBO stability", "Sampling theorem", "Spectral analysis"],
    difficultyMapping: {
      beginner: ["Signal types", "Basic Fourier series", "Sampling theorem"],
      placement: ["LTI system properties", "Convolution", "Fourier transform properties", "Z-transform basics"],
      gate: ["DTFT", "ROC analysis", "System stability via poles-zeros", "Multi-rate signal processing"],
    },
  },
  {
    id: "communication-engineering",
    name: "Communication Engineering",
    icon: "📻",
    color: "#f59e0b",
    description: "Analog modulation: AM, FM, PM and receiver architectures",
    category: "core",
    topics: [
      {
        name: "Amplitude Modulation",
        subtopics: ["Standard AM", "DSB-SC", "SSB-SC", "VSB", "Modulation index", "Power distribution", "AM demodulation (envelope detector)"],
        keywords: ["carrier", "modulating signal", "sideband", "bandwidth", "power efficiency"],
      },
      {
        name: "Angle Modulation",
        subtopics: ["FM vs PM", "Modulation index (β)", "Deviation ratio", "Carson's rule", "NBFM/WBFM", "FM demodulation (PLL, discriminator)"],
        keywords: ["instantaneous frequency", "frequency deviation", "Bessel functions", "capture effect", "pre-emphasis"],
      },
      {
        name: "Receivers",
        subtopics: ["TRF receiver", "Superheterodyne receiver", "IF amplifier", "Image frequency", "Sensitivity", "Selectivity", "AGC"],
        keywords: ["local oscillator", "mixer", "IF stage", "image rejection ratio"],
      },
      {
        name: "Noise in Communication",
        subtopics: ["Thermal noise", "Shot noise", "SNR", "Noise figure", "Friis formula", "Noise in AM/FM receivers"],
        keywords: ["noise temperature", "noise power", "figure of merit", "SNR improvement"],
      },
    ],
    expectedSkills: ["Modulation/demodulation analysis", "Bandwidth calculation", "Receiver design", "SNR computation"],
    referenceConcepts: ["Carson's rule", "Friis noise formula", "Superhet principle", "AM power equation"],
    difficultyMapping: {
      beginner: ["AM modulation index", "FM vs AM differences", "Superheterodyne block diagram"],
      placement: ["DSB/SSB power comparison", "Carson's rule", "Image frequency calculation", "Noise figure"],
      gate: ["SNR analysis", "FM demodulator design", "Threshold effect in FM", "Preemphasis/deemphasis"],
    },
  },
  {
    id: "digital-communication",
    name: "Digital Communication",
    icon: "📡",
    color: "#6366f1",
    description: "Digital modulation, error coding, channel capacity",
    category: "core",
    topics: [
      {
        name: "Pulse Modulation",
        subtopics: ["PAM", "PWM", "PPM", "PCM (sampling, quantization, coding)", "Delta modulation", "DPCM", "ADPCM"],
        keywords: ["quantization error", "companding", "A-law", "μ-law", "bit rate", "Nyquist rate"],
      },
      {
        name: "Digital Modulation",
        subtopics: ["ASK", "FSK", "BPSK", "QPSK", "8-PSK", "QAM", "DPSK", "MSK"],
        keywords: ["constellation diagram", "BER", "spectral efficiency", "bandwidth efficiency", "ISI"],
      },
      {
        name: "Spread Spectrum",
        subtopics: ["DSSS", "FHSS", "PN sequence", "Processing gain", "CDMA", "GPS basics"],
        keywords: ["chip rate", "spreading gain", "jamming margin", "correlation"],
      },
      {
        name: "Information Theory",
        subtopics: ["Entropy", "Shannon's capacity", "Channel coding theorem", "Mutual information", "Channel capacity"],
        keywords: ["bits per symbol", "channel capacity", "C = B log₂(1 + SNR)", "lossless vs lossy"],
      },
      {
        name: "Error Detection and Correction",
        subtopics: ["Parity bits", "Hamming code", "CRC", "Convolutional codes", "Viterbi algorithm", "Turbo codes", "LDPC", "Reed-Solomon"],
        keywords: ["code rate", "Hamming distance", "syndrome", "generator polynomial", "BER improvement"],
      },
      {
        name: "Advanced Techniques",
        subtopics: ["OFDM", "MIMO", "MIMO-OFDM", "Multipath fading", "Channel estimation", "Equalization"],
        keywords: ["cyclic prefix", "subcarrier", "inter-symbol interference", "spatial multiplexing"],
      },
    ],
    expectedSkills: ["BER analysis", "Modulation selection", "Channel capacity calculation", "Error coding design"],
    referenceConcepts: ["Shannon-Hartley theorem", "Nyquist criterion", "Constellation analysis", "Hamming code"],
    difficultyMapping: {
      beginner: ["PCM steps", "ASK/FSK/PSK basics", "Hamming code basics"],
      placement: ["QPSK vs BPSK BER", "Shannon's capacity", "CRC generation", "OFDM basics"],
      gate: ["BER derivation", "Information entropy", "Convolutional code trellis", "MIMO capacity"],
    },
  },
  {
    id: "microprocessors",
    name: "Microprocessors",
    icon: "🖥️",
    color: "#10b981",
    description: "8085, 8086, ARM architecture and assembly programming",
    category: "core",
    topics: [
      {
        name: "8085 Microprocessor",
        subtopics: ["Architecture", "Register set", "ALU", "Control signals", "Addressing modes", "Instruction set", "Timing diagrams", "Interrupts"],
        keywords: ["accumulator", "program counter", "stack pointer", "flags register", "ALE", "HOLD/HLDA"],
      },
      {
        name: "8086 Microprocessor",
        subtopics: ["Architecture (BIU/EU)", "Register set", "Memory segmentation", "Addressing modes", "Instruction set", "Interrupts", "DMA"],
        keywords: ["segment registers", "effective address", "physical address", "instruction queue", "pipeline"],
      },
      {
        name: "8051 Microcontroller",
        subtopics: ["Architecture", "SFRs", "Memory organization", "Timers/Counters", "Serial communication", "Interrupts", "I/O ports"],
        keywords: ["PSW", "DPTR", "TH0/TL0", "SBUF", "SCON", "TMOD", "IE register"],
      },
      {
        name: "ARM Architecture",
        subtopics: ["RISC vs CISC", "ARM Cortex-M series", "Register set", "Thumb instruction set", "Pipeline", "Exception handling", "Memory map"],
        keywords: ["load-store architecture", "barrel shifter", "CPSR", "NVIC", "SysTick"],
      },
    ],
    expectedSkills: ["Assembly programming", "Timing analysis", "Interrupt programming", "Memory interfacing"],
    referenceConcepts: ["Von Neumann vs Harvard", "DMA transfer", "Interrupt latency", "Bus cycle timing"],
    difficultyMapping: {
      beginner: ["8085 block diagram", "Register functions", "Basic instructions"],
      placement: ["8085 instruction timing", "8051 timer configuration", "ARM Cortex basics", "Interrupt priority"],
      gate: ["8086 memory segmentation", "Pipeline hazards", "DMA controller", "Interrupt service routines"],
    },
  },
  {
    id: "embedded-systems",
    name: "Embedded Systems",
    icon: "⚙️",
    color: "#f59e0b",
    description: "RTOS, device drivers, communication protocols, power management",
    category: "applied",
    topics: [
      {
        name: "Embedded C Programming",
        subtopics: ["Data types", "Bit manipulation", "Pointers", "Volatile keyword", "Interrupt service routines", "Memory-mapped I/O", "Circular buffers"],
        keywords: ["bit masking", "register access", "memory layout", "stack overflow", "watchdog"],
      },
      {
        name: "RTOS Concepts",
        subtopics: ["Tasks and scheduling", "Preemptive/cooperative", "Priority inversion", "Mutexes/semaphores", "Message queues", "FreeRTOS basics"],
        keywords: ["task state", "context switch", "tick rate", "stack allocation", "deadlock"],
      },
      {
        name: "Communication Protocols",
        subtopics: ["UART/USART", "SPI (master/slave)", "I2C (addressing, ACK/NACK)", "CAN bus", "RS-485", "1-Wire", "Modbus"],
        keywords: ["baud rate", "MOSI/MISO", "SDA/SCL", "CRC", "arbitration", "differential signaling"],
      },
      {
        name: "Peripherals",
        subtopics: ["ADC (SAR, Delta-Sigma)", "DAC", "Timers", "PWM", "DMA", "Watchdog timer", "RTC"],
        keywords: ["resolution", "sampling rate", "conversion time", "duty cycle", "DMA channels"],
      },
      {
        name: "Power Management",
        subtopics: ["Sleep modes", "Clock gating", "Dynamic voltage scaling", "Brown-out detection", "Energy harvesting basics"],
        keywords: ["low power mode", "sleep current", "wake-up source", "regulator efficiency"],
      },
    ],
    expectedSkills: ["RTOS task design", "Protocol debugging", "ADC/DAC interfacing", "Power optimization", "Driver development"],
    referenceConcepts: ["Real-time constraints", "Priority ceiling protocol", "Bus arbitration", "DMA transfer modes"],
    difficultyMapping: {
      beginner: ["UART configuration", "GPIO programming", "Timer basics"],
      placement: ["SPI/I2C protocol comparison", "RTOS task scheduling", "ADC interfacing", "PWM generation"],
      gate: ["Priority inversion solutions", "CAN bus arbitration", "DMA vs interrupt comparison", "FreeRTOS internals"],
    },
  },
  {
    id: "control-systems",
    name: "Control Systems",
    icon: "🎛️",
    color: "#84cc16",
    description: "Transfer functions, stability analysis, PID controllers, state space",
    category: "core",
    topics: [
      {
        name: "System Modeling",
        subtopics: ["Transfer function", "Block diagram reduction", "Signal flow graph", "Mason's gain formula", "Electrical/mechanical analogies"],
        keywords: ["poles", "zeros", "order", "type number", "characteristic equation"],
      },
      {
        name: "Time Domain Analysis",
        subtopics: ["First/second order systems", "Transient response", "Rise time", "Settling time", "Overshoot", "Steady-state error", "Error constants"],
        keywords: ["damping ratio", "natural frequency", "unit step response", "impulse response", "Kp Kv Ka"],
      },
      {
        name: "Frequency Domain Analysis",
        subtopics: ["Bode plot", "Nyquist plot", "Polar plot", "Nichols chart", "Gain margin", "Phase margin", "Bandwidth"],
        keywords: ["gain crossover frequency", "phase crossover frequency", "resonant peak", "cutoff frequency"],
      },
      {
        name: "Stability Analysis",
        subtopics: ["BIBO stability", "Routh-Hurwitz criterion", "Root locus technique", "Nyquist stability criterion", "Relative stability"],
        keywords: ["characteristic polynomial", "Routh array", "gain margin", "asymptote", "breakaway point"],
      },
      {
        name: "Controllers",
        subtopics: ["P/PI/PD/PID controllers", "Lag/lead compensators", "Lag-lead compensator", "Ziegler-Nichols tuning", "State feedback (pole placement)"],
        keywords: ["proportional gain", "integral time", "derivative time", "bandwidth improvement", "steady-state improvement"],
      },
      {
        name: "State Space",
        subtopics: ["State variables", "State equation", "Transfer function from state space", "Controllability/Observability", "State feedback design"],
        keywords: ["state transition matrix", "Cayley-Hamilton theorem", "Ackermann's formula", "Observer design"],
      },
    ],
    expectedSkills: ["Bode/Nyquist plot sketching", "Root locus analysis", "PID tuning", "State space modeling"],
    referenceConcepts: ["Mason's rule", "Routh-Hurwitz", "Root locus rules", "Nyquist criterion"],
    difficultyMapping: {
      beginner: ["Transfer function concept", "Block diagram reduction", "First-order step response"],
      placement: ["Bode plot sketching", "Routh-Hurwitz stability", "Root locus", "PID controller effects"],
      gate: ["Phase margin/gain margin", "State space controllability", "Nyquist criterion", "Lag-lead compensator design"],
    },
  },
  {
    id: "dsp",
    name: "Digital Signal Processing",
    icon: "📈",
    color: "#a855f7",
    description: "DFT, FFT, digital filters, DSP processors",
    category: "applied",
    topics: [
      {
        name: "DFT and FFT",
        subtopics: ["DFT definition", "IDFT", "Circular convolution", "Linear vs circular", "FFT algorithm (Cooley-Tukey)", "DIT-FFT", "DIF-FFT"],
        keywords: ["twiddle factor", "butterfly computation", "bit reversal", "zero padding", "spectral leakage"],
      },
      {
        name: "Digital Filters",
        subtopics: ["FIR filter design", "IIR filter design", "Window method (Hanning, Hamming, Blackman)", "Bilinear transformation", "Impulse invariance", "Butterworth/Chebyshev/Elliptic"],
        keywords: ["linear phase", "causality", "stability", "ripple", "transition band", "cutoff frequency"],
      },
      {
        name: "Z-Transform and DSP",
        subtopics: ["Z-transform review", "Difference equations", "IIR structures (Direct Form I/II)", "FIR structures", "Quantization effects in DSP"],
        keywords: ["coefficient quantization", "round-off noise", "overflow", "fixed-point arithmetic"],
      },
      {
        name: "DSP Processors",
        subtopics: ["Harvard architecture", "MAC unit", "Pipelining", "TMS320 family", "SHARC DSP", "Fixed vs floating point DSP"],
        keywords: ["zero overhead loop", "circular buffering", "bit-reversed addressing", "SIMD"],
      },
    ],
    expectedSkills: ["FFT computation", "Filter design", "DSP algorithm implementation", "Frequency analysis"],
    referenceConcepts: ["DFT-FFT relationship", "Bilinear transform", "Windowing", "Filter specifications"],
    difficultyMapping: {
      beginner: ["DFT definition and examples", "FIR vs IIR comparison", "FFT concept"],
      placement: ["FFT algorithm steps", "FIR filter using window method", "Bilinear transformation", "Filter specifications"],
      gate: ["Circular convolution", "FFT butterfly computation", "Quantization noise", "IIR filter structures"],
    },
  },
  {
    id: "vlsi",
    name: "VLSI Design",
    icon: "🔬",
    color: "#ec4899",
    description: "CMOS logic, fabrication, layout, Verilog, FPGA",
    category: "advanced",
    topics: [
      {
        name: "CMOS Technology",
        subtopics: ["NMOS/PMOS characteristics", "CMOS inverter", "Static CMOS gates", "Transmission gates", "Dynamic logic", "Pass transistor logic"],
        keywords: ["threshold voltage", "noise margin", "switching threshold", "rise/fall time", "power dissipation"],
      },
      {
        name: "IC Fabrication",
        subtopics: ["Oxidation", "Photolithography", "Etching", "Diffusion/Ion implantation", "Metallization", "CMOS process flow"],
        keywords: ["mask", "resist", "dopant", "epitaxial layer", "gate oxide", "contact"],
      },
      {
        name: "CMOS Layout",
        subtopics: ["Design rules", "Lambda rules", "Stick diagrams", "Layout techniques", "DRC/LVS", "Parasitic extraction"],
        keywords: ["poly", "diffusion", "metal layers", "via", "pitch", "channel length"],
      },
      {
        name: "Timing Analysis",
        subtopics: ["Setup/hold time", "Clock skew", "Static timing analysis", "Critical path", "Slack", "Setup violation"],
        keywords: ["propagation delay", "clock uncertainty", "timing margin", "timing arc"],
      },
      {
        name: "Verilog HDL",
        subtopics: ["Module syntax", "Data types", "Behavioral modeling", "Structural modeling", "Test bench", "Synthesis concepts"],
        keywords: ["always block", "assign statement", "wire/reg", "posedge", "non-blocking assignment"],
      },
      {
        name: "FPGA Design",
        subtopics: ["LUT-based architecture", "CLB", "IOB", "FPGA design flow", "Xilinx/Intel FPGA", "Hard IP blocks"],
        keywords: ["look-up table", "routing resources", "bitstream", "configuration memory", "DSP slice"],
      },
    ],
    expectedSkills: ["CMOS gate design", "Verilog coding", "Timing analysis", "FPGA programming"],
    referenceConcepts: ["CMOS static behavior", "Setup/hold time constraints", "Verilog synthesis", "FPGA architecture"],
    difficultyMapping: {
      beginner: ["CMOS inverter operation", "Basic Verilog syntax", "FPGA concept"],
      placement: ["CMOS gate sizing", "Verilog FSM implementation", "Timing constraints", "FPGA design flow"],
      gate: ["Power dissipation in CMOS", "Layout DRC rules", "Static timing analysis", "HDL synthesis issues"],
    },
  },
  {
    id: "wireless-communication",
    name: "Wireless Communication",
    icon: "📶",
    color: "#0ea5e9",
    description: "Mobile networks, 4G/5G, MIMO, channel models",
    category: "advanced",
    topics: [
      {
        name: "Mobile Communication Evolution",
        subtopics: ["1G to 5G evolution", "GSM architecture", "CDMA", "WCDMA", "LTE/LTE-A", "5G NR", "Network slicing"],
        keywords: ["handoff", "roaming", "base station", "spectrum", "modulation scheme", "bandwidth"],
      },
      {
        name: "Channel Models",
        subtopics: ["Path loss", "Shadowing", "Multipath fading", "Rayleigh/Rician fading", "Doppler effect", "Coherence bandwidth", "Coherence time"],
        keywords: ["fading margin", "delay spread", "Doppler spread", "AWGN", "log-normal"],
      },
      {
        name: "MIMO Technology",
        subtopics: ["Spatial multiplexing", "Diversity techniques", "Beamforming", "Massive MIMO", "MIMO capacity", "Channel estimation"],
        keywords: ["antenna array", "spatial streams", "SVD decomposition", "water-filling", "precoding"],
      },
      {
        name: "5G NR",
        subtopics: ["mmWave", "Sub-6 GHz", "NR frame structure", "Numerology", "Beamforming in 5G", "Network slicing", "MEC"],
        keywords: ["sub-THz", "latency", "throughput", "FR1/FR2", "gNB", "UE categories"],
      },
    ],
    expectedSkills: ["Channel modeling", "Link budget analysis", "MIMO capacity calculation", "5G architecture understanding"],
    referenceConcepts: ["Shannon capacity", "Friis transmission equation", "Fading models", "OFDM in LTE"],
    difficultyMapping: {
      beginner: ["GSM vs CDMA", "What is 5G", "Basic fading concepts"],
      placement: ["LTE vs 5G NR", "MIMO advantages", "Multipath fading effects", "Handoff types"],
      gate: ["MIMO capacity derivation", "Rayleigh fading statistics", "OFDM in wireless", "Channel estimation"],
    },
  },
  {
    id: "antennas",
    name: "Antennas & Wave Propagation",
    icon: "📡",
    color: "#14b8a6",
    description: "Antenna parameters, radiation patterns, wave propagation",
    category: "applied",
    topics: [
      {
        name: "Antenna Fundamentals",
        subtopics: ["Radiation mechanism", "Radiation pattern", "Directivity", "Gain", "Efficiency", "Polarization", "Bandwidth", "Impedance matching"],
        keywords: ["HPBW", "FNBW", "effective aperture", "beamwidth", "sidelobes", "front-to-back ratio"],
      },
      {
        name: "Antenna Types",
        subtopics: ["Dipole antenna", "Monopole", "Loop antenna", "Yagi-Uda", "Horn antenna", "Patch/microstrip antenna", "Parabolic reflector", "Array antenna"],
        keywords: ["half-wave dipole", "quarter-wave monopole", "driven element", "director", "reflector"],
      },
      {
        name: "Wave Propagation",
        subtopics: ["Ground wave", "Sky wave (ionospheric)", "Space wave (line-of-sight)", "Troposcatter", "Satellite link", "Free space path loss"],
        keywords: ["critical frequency", "MUF", "skip distance", "Fresnel zone", "line-of-sight distance"],
      },
    ],
    expectedSkills: ["Antenna parameter calculation", "Friis equation", "Pattern analysis", "Link budget"],
    referenceConcepts: ["Friis transmission equation", "Reciprocity theorem", "Radiation resistance", "Effective aperture"],
    difficultyMapping: {
      beginner: ["Antenna types", "Radiation pattern basics", "Gain vs directivity"],
      placement: ["Half-wave dipole analysis", "Yagi-Uda design", "Friis equation application", "Wave propagation modes"],
      gate: ["Array factor calculation", "Aperture antennas", "Polarization mismatch", "MUF calculation"],
    },
  },
  {
    id: "iot",
    name: "Internet of Things",
    icon: "🌐",
    color: "#22c55e",
    description: "IoT architecture, MQTT, ESP32, sensors, cloud integration",
    category: "applied",
    topics: [
      {
        name: "IoT Architecture",
        subtopics: ["3-layer architecture", "Edge/Fog/Cloud computing", "IoT protocols", "IoT security", "Device management"],
        keywords: ["perception layer", "network layer", "application layer", "gateway", "actuator"],
      },
      {
        name: "IoT Protocols",
        subtopics: ["MQTT (publish-subscribe)", "CoAP", "HTTP/REST", "AMQP", "WebSocket", "Bluetooth LE", "Zigbee", "LoRaWAN", "NB-IoT"],
        keywords: ["broker", "topic", "QoS", "payload", "retain", "will message"],
      },
      {
        name: "IoT Hardware",
        subtopics: ["ESP8266/ESP32", "Arduino", "Raspberry Pi", "Sensors (temperature, humidity, motion)", "Actuators", "RFID", "LoRa modules"],
        keywords: ["GPIO", "I2C sensor", "PWM motor", "ADC reading", "WiFi provisioning"],
      },
      {
        name: "Cloud Integration",
        subtopics: ["AWS IoT Core", "Google IoT", "Azure IoT Hub", "ThingSpeak", "IFTTT", "Node-RED", "Grafana dashboard"],
        keywords: ["device shadow", "cloud rules", "data pipeline", "time-series database", "alerting"],
      },
    ],
    expectedSkills: ["ESP32 programming", "MQTT implementation", "Cloud dashboard setup", "Sensor integration"],
    referenceConcepts: ["Publish-subscribe model", "Edge computing", "REST API for IoT", "Power budgeting for IoT"],
    difficultyMapping: {
      beginner: ["What is IoT", "ESP32 pinout", "MQTT basics"],
      placement: ["IoT architecture layers", "MQTT vs HTTP for IoT", "ESP32 WiFi + sensor project", "Cloud platform comparison"],
      gate: ["IoT security challenges", "LoRaWAN network architecture", "Edge vs cloud trade-offs", "Protocol efficiency analysis"],
    },
  },
  // ── SOFTWARE / CS FUNDAMENTALS ────────────────────────────────────────────
  {
    id: "computer-networks",
    name: "Computer Networks",
    icon: "🔗",
    color: "#f97316",
    description: "OSI model, TCP/IP, routing, switching, network protocols",
    category: "software",
    topics: [
      {
        name: "OSI and TCP/IP Model",
        subtopics: ["7 OSI layers", "TCP/IP layers", "Layer functions", "Protocol mapping", "Encapsulation/Decapsulation"],
        keywords: ["PDU", "frame", "packet", "segment", "bit", "header", "payload"],
      },
      {
        name: "Data Link Layer",
        subtopics: ["MAC address", "ARP", "Ethernet", "CSMA/CD", "CSMA/CA", "VLANs", "Spanning tree protocol"],
        keywords: ["collision domain", "broadcast domain", "switch", "frame format", "802.3"],
      },
      {
        name: "Network Layer",
        subtopics: ["IP addressing (IPv4/IPv6)", "Subnetting", "CIDR", "Routing algorithms (Dijkstra, Bellman-Ford)", "RIP/OSPF/BGP", "NAT", "ICMP"],
        keywords: ["subnet mask", "default gateway", "routing table", "TTL", "fragmentation"],
      },
      {
        name: "Transport Layer",
        subtopics: ["TCP vs UDP", "TCP 3-way handshake", "Flow control", "Congestion control", "Port numbers", "Socket programming"],
        keywords: ["SYN/ACK/FIN", "sliding window", "slow start", "RTT", "MSS"],
      },
      {
        name: "Application Layer",
        subtopics: ["HTTP/HTTPS", "DNS", "SMTP/POP3/IMAP", "FTP/SFTP", "DHCP", "SSH", "WebSocket"],
        keywords: ["request/response", "resolver", "MX record", "TLS handshake", "MIME"],
      },
    ],
    expectedSkills: ["Subnetting", "Protocol analysis", "Routing configuration", "Network troubleshooting"],
    referenceConcepts: ["OSI model", "TCP/IP stack", "CSMA protocols", "Routing algorithms"],
    difficultyMapping: {
      beginner: ["OSI layer functions", "IP vs MAC address", "TCP vs UDP"],
      placement: ["Subnetting calculation", "TCP 3-way handshake", "Routing protocol comparison", "VLAN concepts"],
      gate: ["Routing algorithm complexity", "Congestion control mechanisms", "IPv6 transition", "SDN concepts"],
    },
  },
  {
    id: "operating-systems",
    name: "Operating Systems",
    icon: "💾",
    color: "#6366f1",
    description: "Process management, memory management, file systems, synchronization",
    category: "software",
    topics: [
      {
        name: "Process Management",
        subtopics: ["Process vs thread", "Process states", "PCB", "Context switching", "CPU scheduling (FCFS, SJF, Round Robin, Priority)", "Multilevel queues"],
        keywords: ["scheduler", "dispatcher", "CPU burst", "I/O burst", "preemptive", "throughput"],
      },
      {
        name: "Memory Management",
        subtopics: ["Contiguous allocation", "Paging", "Segmentation", "Virtual memory", "Page replacement (FIFO, LRU, Optimal)", "TLB", "Thrashing"],
        keywords: ["page fault", "page table", "frame", "working set", "demand paging", "memory hierarchy"],
      },
      {
        name: "Synchronization",
        subtopics: ["Critical section", "Mutex", "Semaphore", "Monitors", "Deadlock (prevention, avoidance, detection)", "Banker's algorithm"],
        keywords: ["mutual exclusion", "progress", "bounded waiting", "producer-consumer", "dining philosophers"],
      },
      {
        name: "File Systems",
        subtopics: ["File allocation (contiguous, linked, indexed)", "Directory structures", "FAT", "inode", "ext4", "NTFS", "Journaling"],
        keywords: ["block size", "inode table", "directory entry", "hard link", "symbolic link"],
      },
    ],
    expectedSkills: ["Scheduling algorithm analysis", "Deadlock handling", "Page fault rate analysis", "Synchronization design"],
    referenceConcepts: ["Banker's algorithm", "LRU vs FIFO comparison", "Process synchronization", "Virtual memory"],
    difficultyMapping: {
      beginner: ["Process vs thread", "CPU scheduling types", "Paging concept"],
      placement: ["Scheduling algorithm comparison", "Deadlock conditions", "Page replacement algorithms", "Semaphore vs mutex"],
      gate: ["Optimal scheduling proof", "Banker's algorithm state safety", "TLB miss handling", "File system performance"],
    },
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    icon: "🗄️",
    color: "#0891b2",
    description: "Relational model, SQL, normalization, transactions, NoSQL",
    category: "software",
    topics: [
      {
        name: "Relational Model",
        subtopics: ["ER model", "Relational algebra", "Keys (primary, foreign, candidate, super)", "Functional dependencies", "Integrity constraints"],
        keywords: ["entity", "attribute", "relation", "tuple", "domain", "referential integrity"],
      },
      {
        name: "SQL",
        subtopics: ["DDL (CREATE/ALTER/DROP)", "DML (SELECT/INSERT/UPDATE/DELETE)", "DCL", "Joins (inner/outer/self)", "Subqueries", "Aggregation", "Indexes", "Views"],
        keywords: ["GROUP BY", "HAVING", "ORDER BY", "JOIN condition", "NULL handling", "window functions"],
      },
      {
        name: "Normalization",
        subtopics: ["1NF/2NF/3NF/BCNF", "Decomposition", "Lossless join", "Dependency preservation", "4NF/5NF"],
        keywords: ["partial dependency", "transitive dependency", "candidate key", "functional dependency"],
      },
      {
        name: "Transactions and Concurrency",
        subtopics: ["ACID properties", "Transaction states", "Isolation levels", "Concurrency problems (dirty read, phantom)", "Lock-based protocols", "Two-phase locking"],
        keywords: ["atomicity", "serializability", "conflict serializability", "deadlock in DB", "timestamp ordering"],
      },
    ],
    expectedSkills: ["SQL query writing", "ER diagram design", "Normalization to BCNF", "Transaction management"],
    referenceConcepts: ["ACID", "Armstrong's axioms", "Normalization forms", "Two-phase locking"],
    difficultyMapping: {
      beginner: ["ER diagram", "Basic SQL", "Primary vs foreign key"],
      placement: ["Complex SQL joins", "Normalization to 3NF", "ACID properties", "Index types"],
      gate: ["BCNF decomposition", "Conflict serializability", "Lock compatibility matrix", "Query optimization"],
    },
  },
  {
    id: "oop",
    name: "Object Oriented Programming",
    icon: "🧩",
    color: "#7c3aed",
    description: "OOP principles, design patterns, Java/C++ concepts",
    category: "software",
    topics: [
      {
        name: "OOP Fundamentals",
        subtopics: ["Classes and objects", "Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "Constructors/destructors", "Access specifiers"],
        keywords: ["method overriding", "method overloading", "interface", "abstract class", "IS-A vs HAS-A"],
      },
      {
        name: "Advanced OOP",
        subtopics: ["Templates (C++)", "Generics (Java)", "Exception handling", "Operator overloading", "Virtual functions", "Pure virtual", "vtable"],
        keywords: ["RTTI", "dynamic dispatch", "compile-time vs runtime polymorphism", "multiple inheritance", "diamond problem"],
      },
      {
        name: "Design Patterns",
        subtopics: ["Singleton", "Factory", "Observer", "Strategy", "Decorator", "Adapter", "SOLID principles"],
        keywords: ["creational pattern", "structural pattern", "behavioral pattern", "dependency injection"],
      },
    ],
    expectedSkills: ["Class design", "Inheritance hierarchy", "Polymorphism implementation", "Design pattern application"],
    referenceConcepts: ["SOLID principles", "Design patterns (GoF)", "UML class diagrams", "vtable mechanism"],
    difficultyMapping: {
      beginner: ["Class vs object", "Inheritance example", "Encapsulation benefit"],
      placement: ["Virtual functions", "Design pattern examples", "Abstract class vs interface", "Exception handling"],
      gate: ["vtable mechanism", "Multiple inheritance", "Template metaprogramming", "SOLID violations detection"],
    },
  },
  {
    id: "data-structures",
    name: "Data Structures",
    icon: "🌲",
    color: "#dc2626",
    description: "Arrays, linked lists, trees, graphs, hash tables, heaps",
    category: "software",
    topics: [
      {
        name: "Linear Structures",
        subtopics: ["Arrays (1D/2D)", "Linked list (singly/doubly/circular)", "Stack (push/pop, applications)", "Queue (types: circular, priority, dequeue)"],
        keywords: ["time complexity", "space complexity", "cache locality", "dynamic allocation"],
      },
      {
        name: "Trees",
        subtopics: ["Binary tree", "BST", "AVL tree", "Red-black tree", "B-tree/B+ tree", "Segment tree", "Trie", "Heap (min/max)"],
        keywords: ["traversal", "height", "balanced", "rotation", "insertion/deletion", "heapify"],
      },
      {
        name: "Graphs",
        subtopics: ["Representation (adjacency matrix/list)", "BFS", "DFS", "Shortest path (Dijkstra, Bellman-Ford, Floyd-Warshall)", "MST (Prim, Kruskal)", "Topological sort", "SCC"],
        keywords: ["weighted/unweighted", "directed/undirected", "cycle detection", "relaxation", "greedy"],
      },
      {
        name: "Hashing",
        subtopics: ["Hash function", "Collision handling (chaining, open addressing)", "Load factor", "Rehashing"],
        keywords: ["hash table", "bucket", "probe sequence", "universal hashing"],
      },
    ],
    expectedSkills: ["Complexity analysis", "Algorithmic thinking", "Data structure selection", "Implementation"],
    referenceConcepts: ["Big-O notation", "Amortized analysis", "Cache complexity", "NP-completeness basics"],
    difficultyMapping: {
      beginner: ["Array vs linked list", "Stack/Queue applications", "Binary tree traversal"],
      placement: ["BST operations complexity", "Dijkstra's algorithm", "AVL rotations", "Heap sort"],
      gate: ["Amortized analysis", "Red-black tree properties", "Graph algorithm correctness", "Advanced DP"],
    },
  },
  {
    id: "algorithms",
    name: "Algorithms",
    icon: "⚡",
    color: "#ca8a04",
    description: "Sorting, searching, dynamic programming, greedy, graph algorithms",
    category: "software",
    topics: [
      {
        name: "Sorting and Searching",
        subtopics: ["Bubble/Selection/Insertion", "Merge sort", "Quick sort", "Heap sort", "Counting/Radix/Bucket sort", "Binary search", "Ternary search"],
        keywords: ["stable sort", "in-place", "worst/average/best case", "divide and conquer"],
      },
      {
        name: "Dynamic Programming",
        subtopics: ["Memoization vs tabulation", "0/1 Knapsack", "LCS", "LIS", "Matrix chain", "Edit distance", "Coin change", "DP on trees/graphs"],
        keywords: ["optimal substructure", "overlapping subproblems", "state definition", "recurrence relation"],
      },
      {
        name: "Greedy Algorithms",
        subtopics: ["Activity selection", "Fractional knapsack", "Huffman coding", "Prim's/Kruskal's MST", "Dijkstra"],
        keywords: ["greedy choice property", "exchange argument", "locally optimal", "globally optimal"],
      },
      {
        name: "Advanced Topics",
        subtopics: ["Divide and conquer", "Backtracking", "Branch and bound", "NP-completeness", "Approximation algorithms", "Randomized algorithms"],
        keywords: ["P vs NP", "reduction", "NP-hard", "2-SAT", "polynomial time"],
      },
    ],
    expectedSkills: ["Time complexity analysis", "Algorithm design", "Problem reduction", "Optimization"],
    referenceConcepts: ["Master theorem", "Optimal substructure", "NP-completeness reductions", "Amortized analysis"],
    difficultyMapping: {
      beginner: ["Sorting algorithm comparison", "Binary search", "Simple DP problems"],
      placement: ["Quick sort partition", "Common DP problems", "Greedy vs DP distinction", "Graph algorithm complexity"],
      gate: ["Master theorem application", "NP-completeness proof", "Advanced DP optimization", "Randomized algorithm analysis"],
    },
  },
  {
    id: "network-theory",
    name: "Network Theory",
    icon: "🔌",
    color: "#0d9488",
    description: "Circuit theorems, network analysis, two-port networks",
    category: "core",
    topics: [
      {
        name: "Network Theorems",
        subtopics: ["KVL/KCL", "Thevenin/Norton", "Superposition", "Maximum power transfer", "Tellegen's theorem", "Reciprocity theorem", "Millman's theorem"],
        keywords: ["open circuit voltage", "short circuit current", "source transformation", "equivalent circuit"],
      },
      {
        name: "AC Circuit Analysis",
        subtopics: ["Phasors", "Impedance/Admittance", "Series/parallel RLC", "Resonance (series/parallel)", "Q-factor", "Power factor", "Reactive power"],
        keywords: ["impedance", "reactance", "susceptance", "apparent power", "power triangle"],
      },
      {
        name: "Two-Port Networks",
        subtopics: ["Z parameters", "Y parameters", "H parameters", "ABCD parameters", "Conversion between parameters", "T and π equivalents"],
        keywords: ["open circuit impedance", "short circuit admittance", "transmission matrix", "reciprocal network"],
      },
      {
        name: "Network Functions",
        subtopics: ["Driving point impedance", "Transfer function", "Poles and zeros", "Frequency response", "Bode plot basics", "Passive filter design"],
        keywords: ["LC ladder", "Foster form", "Cauer form", "positive real function"],
      },
    ],
    expectedSkills: ["Mesh/nodal analysis", "Thevenin equivalent", "Resonance analysis", "Two-port parameter calculation"],
    referenceConcepts: ["KVL/KCL", "Thevenin's theorem", "Superposition principle", "Resonance conditions"],
    difficultyMapping: {
      beginner: ["KVL/KCL application", "Thevenin's theorem", "Series/parallel circuits"],
      placement: ["Norton equivalent", "AC power analysis", "Resonance frequency calculation", "Two-port Z-parameters"],
      gate: ["Two-port parameter conversion", "Network synthesis", "Driving point functions", "Signal flow graphs"],
    },
  },
  {
    id: "mathematics",
    name: "Engineering Mathematics",
    icon: "🔢",
    color: "#64748b",
    description: "Linear algebra, probability, differential equations, complex analysis",
    category: "software",
    topics: [
      {
        name: "Linear Algebra",
        subtopics: ["Matrix operations", "Determinants", "Eigenvalues/eigenvectors", "Linear transformations", "Rank/nullity", "Orthogonalization"],
        keywords: ["singular matrix", "trace", "characteristic polynomial", "Gram-Schmidt", "SVD"],
      },
      {
        name: "Probability and Statistics",
        subtopics: ["Probability axioms", "Conditional probability", "Bayes theorem", "Random variables", "PDF/CDF", "Expectation/Variance", "Common distributions", "CLT"],
        keywords: ["independent events", "Gaussian distribution", "Poisson process", "confidence interval", "hypothesis testing"],
      },
      {
        name: "Differential Equations",
        subtopics: ["First order ODE", "Second order ODE", "Homogeneous/non-homogeneous", "Particular solution", "Laplace transform method", "Series solution"],
        keywords: ["integrating factor", "characteristic equation", "undetermined coefficients", "variation of parameters"],
      },
      {
        name: "Complex Analysis",
        subtopics: ["Complex numbers", "Analytic functions", "Cauchy-Riemann equations", "Complex integration", "Residue theorem", "Laurent series"],
        keywords: ["real/imaginary part", "modulus", "argument", "pole", "residue", "contour integration"],
      },
    ],
    expectedSkills: ["Matrix operations", "Probability calculation", "ODE solving", "Transform methods"],
    referenceConcepts: ["Eigenvalue decomposition", "Bayes theorem", "Laplace method for ODE", "Residue theorem"],
    difficultyMapping: {
      beginner: ["Matrix multiplication", "Probability basics", "First order ODE"],
      placement: ["Eigenvalue calculation", "Bayes theorem application", "Laplace ODE method", "Normal distribution"],
      gate: ["SVD", "Complex analysis", "Second order ODE with variable coefficients", "Multivariate statistics"],
    },
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getSubjectById(id: string): ETCSubjectData | undefined {
  return ETC_SUBJECTS.find((s) => s.id === id);
}

export function getSubjectsByCategory(
  category: ETCSubjectData["category"]
): ETCSubjectData[] {
  return ETC_SUBJECTS.filter((s) => s.category === category);
}

export function getTopicNamesForSubject(subjectId: string): string[] {
  const subject = getSubjectById(subjectId);
  if (!subject) return [];
  return subject.topics.map((t) => t.name);
}

export function buildSubjectContextPrompt(subjectId: string, difficulty: string): string {
  const subject = getSubjectById(subjectId);
  if (!subject) return "";

  const difficultyTopics =
    subject.difficultyMapping[difficulty as keyof typeof subject.difficultyMapping] ??
    subject.difficultyMapping.placement;

  const allTopics = subject.topics.map((t) => t.name).join(", ");
  const allKeywords = subject.topics.flatMap((t) => t.keywords).slice(0, 15).join(", ");

  return `
Subject: ${subject.name}
Category: ${subject.category}
All Topics: ${allTopics}
Key Concepts: ${allKeywords}
Expected Skills: ${subject.expectedSkills.join(", ")}
Reference Concepts: ${subject.referenceConcepts.join(", ")}
Focus Topics for "${difficulty}" level: ${difficultyTopics.join(", ")}
`;
}

// ─── Legacy compatibility ─────────────────────────────────────────────────────
// etcSubjects.ts imports from here to maintain backward compatibility.

export type { ETCSubjectData as ETCSubject };
