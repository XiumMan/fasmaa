'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

const LaunchSequence = () => {
  const router = useRouter();
  const [stage, setStage] = useState<'standby' | 'tvOn' | 'matrix' | 'tvOff' | 'video1' | 'networkGrid' | 'video2' | 'countdown' | 'nameReveal' | 'features' | 'logo'>('standby');
  const [countdown, setCountdown] = useState(5);
  const [matrixLines, setMatrixLines] = useState<any[]>([]);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentModule, setCurrentModule] = useState('');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [letterIndex, setLetterIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activatingNodes, setActivatingNodes] = useState<number>(0);
  const [platformLoadingProgress, setPlatformLoadingProgress] = useState(0);
  const [authenticationStatus, setAuthenticationStatus] = useState<'checking' | 'authenticated' | 'authenticating'>('checking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const features = [
    {
      title: "Real-time IPC Surveillance",
      description: "Monitor hospital-acquired infections across the Maldives in real-time with comprehensive data tracking and instant alerts",
      iconPath: "/icons/features/feature-1-surveillance.png",
      showMap: true,
      demo: "surveillance"
    },
    {
      title: "Outbreak Detection",
      description: "Automated cluster detection with instant alerts when unusual infection patterns emerge in any facility",
      iconPath: "/icons/features/feature-2-outbreak.png",
      showMap: false,
      demo: "outbreak",
      alert: "ALERT: UNUSUAL CLUSTER DETECTED"
    },
    {
      title: "Antimicrobial Stewardship",
      description: "Real-time resistance tracking and antibiotic usage monitoring for optimized treatment protocols",
      iconPath: "/icons/features/feature-3-stewardship.png",
      showMap: false,
      demo: "resistance",
      alert: "TREND: ANTIBIOTIC-X RESISTANCE RISING"
    },
    {
      title: "Automated Reporting",
      description: "Auto-generate compliance reports and seamlessly transmit to Ministry of Health for national surveillance",
      iconPath: "/icons/features/feature-4-reporting.png",
      showMap: false,
      demo: "reporting",
      alert: "ACTION: AUTO-GENERATING COMPLIANCE REPORT"
    },
    {
      title: "Clinical Decision Support",
      description: "Provide clinicians with critical insights and data-driven recommendations for infection prevention",
      iconPath: "/icons/features/feature-5-clinical.png",
      showMap: false,
      demo: "clinical"
    },
    {
      title: "Advanced Analytics",
      description: "Predictive modeling and trend analysis for proactive infection prevention across all healthcare facilities",
      iconPath: "/icons/features/feature-6-analytics.png",
      showMap: false,
      demo: "analytics"
    }
  ];

  const bootSequences = [
    {
      module: "Surveillance System",
      codes: [
        { time: "[    0.000000]", text: "Initializing IPC surveillance kernel...", status: "info" },
        { time: "[    0.125000]", text: "  ├─ Loading infection detection protocols", version: "v2.4.1", status: "info" },
        { time: "[    0.340000]", text: "  ├─ Mounting surveillance filesystem...", result: "OK", status: "success" },
        { time: "[    0.521000]", text: "  └─ Starting real-time monitoring daemon", status: "info" }
      ]
    },
    {
      module: "Database Connection",
      codes: [
        { time: "[    1.002000]", text: "Establishing PostgreSQL connection pool", status: "info" },
        { time: "[    1.156000]", text: "  ├─ Authenticating with credentials...", result: "SECURE", status: "success" },
        { time: "[    1.289000]", text: "  ├─ Database schema validation...", result: "PASSED", status: "success" },
        { time: "[    1.456000]", text: "  └─ Connection pool initialized", detail: "[16 threads]", status: "info" }
      ]
    },
    {
      module: "CLABSI Module",
      codes: [
        { time: "[    2.001000]", text: "Loading CLABSI tracking module", version: "v3.2.0", status: "info" },
        { time: "[    2.134000]", text: "  ├─ Initializing bloodstream infection protocols", status: "info" },
        { time: "[    2.267000]", text: "  ├─ Configuring alert thresholds...", result: "SET", status: "success" },
        { time: "[    2.398000]", text: "  └─ CLABSI module ready", status: "success" }
      ]
    },
    {
      module: "CAUTI Module",
      codes: [
        { time: "[    3.012000]", text: "Loading CAUTI prevention module", version: "v2.8.1", status: "info" },
        { time: "[    3.145000]", text: "  ├─ UTI surveillance protocols activated", status: "success" },
        { time: "[    3.278000]", text: "  ├─ Catheter monitoring enabled...", result: "ACTIVE", status: "success" },
        { time: "[    3.401000]", text: "  └─ CAUTI module operational", status: "success" }
      ]
    },
    {
      module: "SSI Module",
      codes: [
        { time: "[    4.023000]", text: "Initializing SSI management system", version: "v4.1.0", status: "info" },
        { time: "[    4.156000]", text: "  ├─ Surgical site monitoring configured", status: "info" },
        { time: "[    4.289000]", text: "  ├─ Post-operative tracking enabled", status: "success" },
        { time: "[    4.412000]", text: "  └─ SSI module online", status: "success" }
      ]
    },
    {
      module: "MDR Tracking",
      codes: [
        { time: "[    5.034000]", text: "Loading MDR organism detection engine", status: "info" },
        { time: "[    5.167000]", text: "  ├─ Antimicrobial resistance database synced", status: "success" },
        { time: "[    5.298000]", text: "  ├─ Isolation protocol manager started", status: "info" },
        { time: "[    5.423000]", text: "  └─ MDR tracking active", status: "success" }
      ]
    },
    {
      module: "Analytics Engine",
      codes: [
        { time: "[    6.045000]", text: "Calibrating analytics engine", version: "v5.0.2", status: "info" },
        { time: "[    6.178000]", text: "  ├─ ML models loaded", detail: "[infection prediction]", status: "success" },
        { time: "[    6.309000]", text: "  ├─ Data processing pipeline initialized", status: "success" },
        { time: "[    6.434000]", text: "  └─ Analytics ready for deployment", status: "success" }
      ]
    }
  ];

  const fasmaaLetters = [
    { letter: 'F', text: 'Facility' },
    { letter: 'A', text: 'Alert' },
    { letter: 'S', text: 'System for' },
    { letter: 'M', text: 'Microbial' },
    { letter: 'A', text: 'Monitoring &' },
    { letter: 'A', text: 'Antimicrobial Action' }
  ];

  // TV on effect then boot sequence
  useEffect(() => {
    if (stage === 'tvOn') {
      setTimeout(() => setStage('matrix'), 1000);
    }
  }, [stage]);

  // Authentication check and auto-login
  const checkAndAuthenticate = async () => {
    setAuthenticationStatus('checking');

    try {
      // Check if already authenticated
      const demoSession = localStorage.getItem('demo_session');
      const { data: { session } } = await supabase.auth.getSession();

      if (demoSession || session) {
        setAuthenticationStatus('authenticated');
        setIsAuthenticated(true);
        return;
      }

      // Not authenticated - auto-login with demo admin for launch ceremony
      setAuthenticationStatus('authenticating');

      // Create demo admin session
      const demoUser = {
        id: 'launch-ceremony-admin',
        email: 'ceremony@hmh.demo',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const demoProfile = {
        id: 'launch-ceremony-admin',
        user_id: 'launch-ceremony-admin',
        email: 'ceremony@hmh.demo',
        full_name: 'Launch Ceremony Administrator',
        employee_id: 'LAUNCH001',
        role: 'ADMIN',
        department: 'IPC_COMMITTEE',
        is_active: true,
        phone: '+960-999-0000',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store demo session
      localStorage.setItem('demo_session', JSON.stringify({
        user: demoUser,
        profile: demoProfile
      }));

      setAuthenticationStatus('authenticated');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthenticationStatus('authenticated'); // Continue anyway for ceremony
      setIsAuthenticated(true);
    }
  };

  // Boot sequence
  useEffect(() => {
    if (stage === 'matrix') {
      let allCodes: any[] = [];
      bootSequences.forEach(seq => {
        allCodes = [...allCodes, ...seq.codes];
      });

      let currentIndex = 0;
      let currentModuleIndex = 0;
      let codesInCurrentModule = 0;
      let authCheckTriggered = false;
      let codesCompleted = false;

      const interval = setInterval(() => {
        if (currentIndex >= allCodes.length) {
          clearInterval(interval);
          codesCompleted = true;
          return;
        }

        setMatrixLines(prev => [...prev, allCodes[currentIndex]]);

        // Trigger authentication check when we see "Authenticating" message
        const currentCode = allCodes[currentIndex];
        if (!authCheckTriggered && currentCode.text && currentCode.text.includes('Authenticating')) {
          authCheckTriggered = true;
          checkAndAuthenticate();
        }

        codesInCurrentModule++;

        if (currentModuleIndex < bootSequences.length) {
          const currentSeq = bootSequences[currentModuleIndex];
          if (currentSeq && codesInCurrentModule === currentSeq.codes.length) {
            const moduleName = currentSeq.module;
            setCurrentModule(moduleName);
            setTimeout(() => {
              setCompletedModules(prev => [...prev, moduleName]);
              setCurrentModule('');
            }, 700);

            currentModuleIndex++;
            codesInCurrentModule = 0;
          }
        }

        currentIndex++;
      }, 285); // Boot sequence - 285ms per line for 8 second total duration (28 codes × 285ms ≈ 8s)

      const totalCodes = allCodes.length;
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            // Only transition when both codes are done and progress is 100%
            if (codesCompleted) {
              setTimeout(() => setStage('tvOff'), 800);
            }
            return 100;
          }
          // Increment progress to reach 100% in sync with code display
          return prev + (100 / totalCodes);
        });
      }, 285);

      return () => {
        clearInterval(interval);
        clearInterval(progressInterval);
      };
    }
  }, [stage]);

  // TV off then video1
  useEffect(() => {
    if (stage === 'tvOff') {
      setTimeout(() => setStage('video1'), 1200);
    }
  }, [stage]);

  // Video1 (8 seconds) then network grid
  useEffect(() => {
    if (stage === 'video1') {
      setActiveNodeIndex(0); // Reset node index
      // Animate nodes turning red during video
      const nodeInterval = setInterval(() => {
        setActiveNodeIndex(prev => {
          if (prev >= 7) {
            clearInterval(nodeInterval);
            return 7;
          }
          return prev + 1;
        });
      }, 1000); // 8 nodes over 8 seconds

      setTimeout(() => {
        clearInterval(nodeInterval);
        setStage('networkGrid');
      }, 8000);

      return () => clearInterval(nodeInterval);
    }
  }, [stage]);

  // Video2 (8 seconds) then countdown
  useEffect(() => {
    if (stage === 'video2') {
      setActiveNodeIndex(0); // Reset node index
      // Animate nodes turning green during video
      const nodeInterval = setInterval(() => {
        setActiveNodeIndex(prev => {
          if (prev >= 7) {
            clearInterval(nodeInterval);
            return 7;
          }
          return prev + 1;
        });
      }, 1000); // 8 nodes over 8 seconds

      setTimeout(() => {
        clearInterval(nodeInterval);
        setStage('countdown');
      }, 8000);

      return () => clearInterval(nodeInterval);
    }
  }, [stage]);

  // Network grid then video2
  useEffect(() => {
    if (stage === 'networkGrid') {
      setTimeout(() => setStage('video2'), 12000); // 12 seconds for network grid animation
    }
  }, [stage]);

  // Countdown complete - go to name reveal
  useEffect(() => {
    if (stage === 'countdown') {
      // Countdown from 5 to 0
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => setStage('nameReveal'), 6000);

      return () => clearInterval(countdownInterval);
    }
  }, [stage]);

  // Name reveal complete - go to features
  useEffect(() => {
    if (stage === 'nameReveal') {
      setTimeout(() => setStage('features'), 6000); // 6 seconds for name reveal with fasmaa.mp3 audio
    }
  }, [stage]);

  // Features
  useEffect(() => {
    if (stage === 'features') {
      if (currentFeature < features.length) {
        const timer = setTimeout(() => setCurrentFeature(currentFeature + 1), 3000);
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => setStage('logo'), 500);
      }
    }
  }, [stage, currentFeature]);

  // Logo - Phase 4 Climax with loading bar
  useEffect(() => {
    if (stage === 'logo') {
      // Start loading platform after initial animations (2s delay)
      const startLoadingTimeout = setTimeout(() => {
        const loadingInterval = setInterval(() => {
          setPlatformLoadingProgress(prev => {
            if (prev >= 100) {
              clearInterval(loadingInterval);
              return 100;
            }
            return prev + 2; // Increment by 2% every 50ms = 2.5 seconds total
          });
        }, 50);

        return () => clearInterval(loadingInterval);
      }, 2000);

      return () => clearTimeout(startLoadingTimeout);
    }
  }, [stage]);

  // Redirect when platform loading is complete
  useEffect(() => {
    if (platformLoadingProgress >= 100 && stage === 'logo') {
      // Start fade out transition
      setTimeout(() => {
        setIsFadingOut(true);
        // Redirect after fade completes
        setTimeout(() => router.push('/'), 1000);
      }, 500);
    }
  }, [platformLoadingProgress, stage, router]);

  const handleActivate = () => {
    setStage('tvOn');
    setAudioEnabled(true);
  };

  const playAudio = (filename: string) => {
    if (!audioEnabled) return;
    try {
      const audio = new Audio(`/audio/launch/${filename}`);
      audio.volume = 0.7;
      // Try to play and handle autoplay restrictions
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playing:', filename);
          })
          .catch(err => {
            console.warn('Audio autoplay prevented. User interaction required:', err);
            // Audio will work after user clicks the button
          });
      }
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const playSoundEffect = (filename: string, volume: number = 0.5) => {
    if (!audioEnabled) return;
    try {
      const audio = new Audio(`/audio/launch/sfx/${filename}`);
      audio.volume = volume;
      audio.play().catch(err => console.log('Sound effect playback failed:', err));
    } catch (error) {
      console.log('Sound effect error:', error);
    }
  };

  useEffect(() => {
    if (!audioEnabled) return;
    if (stage === 'matrix') {
      playSoundEffect('boot-sequence.mp3', 0.7);
    }
    else if (stage === 'networkGrid') {
      // Play networkgrid.mp3 first, then network-activation.mp3
      playSoundEffect('networkgrid.mp3', 0.7);
      // Play beep sounds for each node activation - Slower timing
      const nodeDelays = [0, 1200, 2400, 3600, 4800, 6000, 7200];
      nodeDelays.forEach(delay => {
        setTimeout(() => playSoundEffect('beep.mp3', 0.4), delay);
      });
      // Play swoosh for connections - Slower timing
      const connectionDelays = [1700, 2900, 4100, 5300, 6500, 7700];
      connectionDelays.forEach(delay => {
        setTimeout(() => playSoundEffect('swoosh.mp3', 0.3), delay);
      });
    }
    else if (stage === 'countdown') {
      playSoundEffect('countdown.mp3', 0.6);
    }
    else if (stage === 'nameReveal') {
      playSoundEffect('fasmaa.mp3', 0.7);
    }
    else if (stage === 'features') {
      // Delay features audio by 1.5 seconds to sync with content
      setTimeout(() => playAudio('features.mp3'), 1500);
    }
    else if (stage === 'logo') {
      playSoundEffect('logo-reveal.mp3', 0.7);
    }
  }, [stage, audioEnabled]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-['Inter',sans-serif]">
      <AnimatePresence mode="wait">
        {/* Standby/Activation Screen */}
        {stage === 'standby' && (
          <motion.div
            key="standby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          >
            {/* Subtle background grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, #4ECDC4 1px, transparent 1px),
                  linear-gradient(to bottom, #4ECDC4 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px'
              }} />
            </div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 text-center space-y-12 px-8 max-w-6xl"
            >
              {/* Logo/System Name */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
              >
                <div className="text-[#4ECDC4] text-8xl md:text-9xl font-black mb-6 tracking-wider">
                  FASMAA
                </div>
                <div className="text-white text-3xl md:text-4xl font-light tracking-widest opacity-80">
                  IPC SURVEILLANCE NETWORK
                </div>
              </motion.div>

              {/* Event Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="border-t border-b border-[#4ECDC4]/30 py-8 mb-12"
              >
                <h1 className="text-white text-4xl md:text-5xl font-semibold mb-4">
                  OFFICIAL LAUNCH CEREMONY
                </h1>
                <p className="text-[#4ECDC4]/70 text-2xl md:text-3xl font-light">
                  Hulhumale Hospital • Republic of Maldives
                </p>
              </motion.div>

              {/* System Status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mb-8 md:mb-16 space-y-4"
              >
                <div className="flex items-center justify-center space-x-4 text-lg md:text-xl text-white">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-4 h-4 bg-[#4ECDC4] rounded-full shadow-lg shadow-[#4ECDC4]/50"
                  />
                  <span className="font-mono">SYSTEM STATUS: STANDBY</span>
                </div>
                <div className="text-gray-400 text-base md:text-lg font-mono">
                  All surveillance modules ready • Network infrastructure online
                </div>
              </motion.div>

              {/* Activate Button */}
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleActivate}
                className="relative group"
              >
                <div className="relative px-20 py-10 text-4xl md:text-5xl font-black text-white bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] rounded-2xl shadow-2xl border-2 border-white/10 hover:border-white/30 transition-all">
                  LAUNCH PLATFORM
                  <div className="text-sm font-normal mt-2 opacity-80">
                    Initialize Surveillance Grid
                  </div>
                </div>
              </motion.button>

              {/* Footer info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-16 text-gray-500 text-sm font-mono"
              >
                FASMAA v1.0 • Developed by Hulhumale Hospital IPC Committee
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* TV Turn On Effect */}
        {stage === 'tvOn' && (
          <motion.div
            key="tvOn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full bg-black flex items-center justify-center"
          >
            {/* Old CRT TV turn-on effect - line from center expanding */}
            <motion.div
              initial={{ scaleY: 0, scaleX: 1, opacity: 1 }}
              animate={{ scaleY: 1, scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full h-full bg-gradient-to-b from-green-900/30 to-black flex items-center justify-center"
            >
              {/* Flash effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.3, 0] }}
                transition={{ duration: 0.8, times: [0, 0.3, 0.6, 1] }}
                className="absolute inset-0 bg-white"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Network Grid Connection Animation */}
        {stage === 'networkGrid' && (
          <motion.div
            key="networkGrid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden py-4 md:py-8"
          >
            {/* Grid background - More subtle */}
            <div className="absolute inset-0 opacity-[0.05]">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, #4ECDC4 1px, transparent 1px),
                  linear-gradient(to bottom, #4ECDC4 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }} />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex-1 flex flex-col">
              {/* Header */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-4 md:mb-6 flex-shrink-0"
              >
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 md:mb-4">
                  INITIALIZING SURVEILLANCE GRID
                </h2>
                <p className="text-lg md:text-2xl text-[#4ECDC4] font-light">
                  Establishing secure connections to healthcare facilities
                </p>
              </motion.div>

              {/* Network Map - Constrained height */}
              <div className="relative flex items-center justify-center flex-shrink-0" style={{ height: '400px' }}>
                {/* SVG Map Placeholder - Added padding to viewBox to prevent cutoff */}
                <svg viewBox="0 0 1200 800" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Hospital Nodes - Expanded layout with FASMAA as central hub, repositioned with padding */}
                  {(() => {
                    const nodes = [
                      { id: 'FASMAA', x: 600, y: 400, label: 'Central Hub', delay: 0 },
                      { id: 'Surgical Ward', x: 300, y: 250, label: 'Surgical Unit', delay: 1.2 },
                      { id: 'Pediatric Ward', x: 900, y: 250, label: 'Pediatric Unit', delay: 2.4 },
                      { id: 'Gyne Ward', x: 200, y: 450, label: 'Gynecology', delay: 3.6 },
                      { id: 'Lab', x: 450, y: 600, label: 'Laboratory', delay: 4.8 },
                      { id: 'HMH ER', x: 750, y: 600, label: 'Emergency Room', delay: 6.0 },
                      { id: 'ICU', x: 1000, y: 450, label: 'Intensive Care', delay: 7.2 },
                      { id: 'Pharmacy', x: 350, y: 150, label: 'Pharmacy', delay: 8.4 }
                    ];

                    // Create network connections - mesh topology with multiple connections
                    const connections = [
                      // FASMAA central connections to all nodes
                      ...nodes.slice(1).map((node, i) => ({ from: 0, to: i + 1, delay: node.delay + 0.5 })),
                      // Inter-node connections for mesh network
                      { from: 1, to: 2, delay: 3.0 }, // Surgical to Pediatric
                      { from: 1, to: 3, delay: 4.0 }, // Surgical to Gyne
                      { from: 2, to: 6, delay: 5.0 }, // Pediatric to ICU
                      { from: 3, to: 4, delay: 6.0 }, // Gyne to Lab
                      { from: 4, to: 5, delay: 7.0 }, // Lab to ER
                      { from: 5, to: 6, delay: 8.0 }, // ER to ICU
                      { from: 1, to: 7, delay: 4.5 }, // Surgical to Pharmacy
                      { from: 7, to: 2, delay: 5.5 }, // Pharmacy to Pediatric
                      { from: 4, to: 6, delay: 7.5 }, // Lab to ICU
                    ];

                    return (
                      <>
                        {/* Connection lines - Multiple connections per node */}
                        {connections.map((conn, idx) => (
                          <motion.line
                            key={`connection-${idx}`}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.5 }}
                            transition={{ delay: conn.delay, duration: 1.0 }}
                            x1={nodes[conn.from].x}
                            y1={nodes[conn.from].y}
                            x2={nodes[conn.to].x}
                            y2={nodes[conn.to].y}
                            stroke="#4ECDC4"
                            strokeWidth="2.5"
                            strokeDasharray="5,5"
                          />
                        ))}

                        {/* Node circles and labels */}
                        {nodes.map((node, index) => (
                          <g key={node.id}>
                            {/* Node circles */}
                            <motion.circle
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: node.delay, type: "spring", stiffness: 200 }}
                              cx={node.x}
                              cy={node.y}
                              r={index === 0 ? 50 : 35}
                              fill={index === 0 ? "#FF6B6B" : "#4ECDC4"}
                              className="drop-shadow-lg"
                            />

                            {/* Pulsating effect */}
                            <motion.circle
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: [1, 2, 1],
                                opacity: [0.8, 0, 0.8]
                              }}
                              transition={{
                                delay: node.delay + 0.5,
                                repeat: Infinity,
                                duration: 2
                              }}
                              cx={node.x}
                              cy={node.y}
                              r={index === 0 ? 50 : 35}
                              fill={index === 0 ? "#FF6B6B" : "#4ECDC4"}
                            />

                            {/* Node labels */}
                            <motion.text
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: node.delay + 0.3 }}
                              x={node.x}
                              y={node.y + (index === 0 ? 70 : 55)}
                              textAnchor="middle"
                              className={index === 0 ? "text-3xl font-black" : "text-2xl font-bold"}
                              fill="white"
                            >
                              {node.id}
                            </motion.text>

                            <motion.text
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.7 }}
                              transition={{ delay: node.delay + 0.4 }}
                              x={node.x}
                              y={node.y + (index === 0 ? 92 : 76)}
                              textAnchor="middle"
                              className="text-lg"
                              fill="#4ECDC4"
                            >
                              {node.label}
                            </motion.text>

                            {/* [SECURE] status */}
                            <motion.text
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: node.delay + 0.6 }}
                              x={node.x}
                              y={node.y - (index === 0 ? 65 : 50)}
                              textAnchor="middle"
                              className="text-base font-mono font-bold"
                              fill="#39FF14"
                            >
                              [SECURE]
                            </motion.text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Status messages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6 space-y-3 max-w-2xl mx-auto flex-shrink-0"
              >
                {[
                  { text: 'Establishing secure network connections...', delay: 0 },
                  { text: 'Authenticating hospital nodes...', delay: 1.5 },
                  { text: 'Synchronizing surveillance protocols...', delay: 3 },
                  { text: 'Network grid operational', delay: 5 }
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: msg.delay }}
                    className="flex items-center space-x-3 text-white font-mono"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-[#4ECDC4] border-t-transparent rounded-full"
                    />
                    <span className="text-lg">{msg.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 6 }}
                className="mt-8 text-center flex-shrink-0"
              >
                <div className="text-[#4ECDC4] text-xl font-mono mb-4">
                  GRID CONNECTION: COMPLETE
                </div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 6.5, duration: 1 }}
                  className="h-2 w-96 mx-auto bg-[#4ECDC4] rounded-full shadow-lg shadow-[#4ECDC4]/50"
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Boot Sequence - Full Black Screen */}
        {stage === 'matrix' && (
          <motion.div
            key="matrix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full bg-black text-green-400 p-8 overflow-hidden"
          >
            {/* Completed modules overlay */}
            <AnimatePresence>
              {completedModules.length > 0 && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="fixed top-8 right-8 bg-black bg-opacity-90 rounded-xl p-6 border border-green-500 max-w-sm z-50"
                >
                  <div className="text-lg text-green-400 font-bold mb-3 flex items-center">
                    <span className="text-2xl mr-2">✓</span>
                    MODULES LOADED
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    {completedModules.map((mod, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-green-400 flex items-center"
                      >
                        <span className="text-green-500 mr-2">●</span>
                        {mod}
                      </motion.div>
                    ))}

                    {/* Authentication Status */}
                    {authenticationStatus !== 'checking' && (
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="mt-4 pt-4 border-t border-green-500/30"
                      >
                        <div className="flex items-center">
                          {authenticationStatus === 'authenticated' ? (
                            <>
                              <span className="text-green-400 mr-2">✓</span>
                              <span className="text-green-400">Authentication: GRANTED</span>
                            </>
                          ) : (
                            <>
                              <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="text-yellow-400 mr-2"
                              >
                                ⚡
                              </motion.span>
                              <span className="text-yellow-400">Authenticating...</span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto h-full flex items-center justify-center">
              {/* Boot codes - Fixed height container */}
              <div className="w-full h-[700px] flex flex-col justify-between">
                <div className="flex-shrink-0">
                  <div className="mb-8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5 }}
                      className="h-1 bg-green-400 mb-4"
                    />
                    <h2 className="text-4xl font-bold text-green-400 font-mono mb-8">
                      FASMAA BOOT SEQUENCE v1.0
                    </h2>
                  </div>

                  <div className="space-y-1 h-[450px] overflow-hidden">
                    {matrixLines.map((line: any, i: number) => {
                      if (!line) return null;
                      const getColor = (status: string) => {
                        if (status === 'success') return 'text-green-400';
                        if (status === 'error') return 'text-red-400';
                        return 'text-green-300';
                      };

                      return (
                        <motion.div
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="font-mono text-lg flex items-center"
                        >
                          <span className="text-cyan-400 font-semibold">{line.time}</span>
                          <span className={`ml-2 ${getColor(line.status)}`}>{line.text}</span>
                          {line.version && <span className="ml-2 text-purple-400 font-semibold">{line.version}</span>}
                          {line.result && <span className="ml-2 text-green-400 font-bold">{line.result}</span>}
                          {line.detail && <span className="ml-2 text-gray-500 italic">{line.detail}</span>}
                          {i === matrixLines.length - 1 && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="inline-block w-2 h-5 bg-green-400 ml-1"
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Module loaded message - Fixed height */}
                  <div className="mt-8 h-[60px]">
                    <AnimatePresence>
                      {currentModule && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center text-2xl font-bold text-green-400"
                        >
                          <span className="mr-3">✓</span>
                          <span>[ OK ] {currentModule} initialized</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-shrink-0">
                  <div className="flex justify-between mb-2 text-green-400 font-mono">
                    <span>LOADING SYSTEM</span>
                    <span>{Math.round(loadingProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-800 rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      className="h-full bg-green-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TV Switch Off Effect - CRT Style */}
        {stage === 'tvOff' && (
          <motion.div
            key="tvOff"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-black relative overflow-hidden flex items-center justify-center"
          >
            <motion.div
              initial={{ scaleY: 1, scaleX: 1 }}
              animate={{ scaleY: 0, scaleX: 1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full h-full bg-gradient-to-b from-green-900/30 via-green-800/20 to-black"
            />
          </motion.div>
        )}

        {/* Video 1 - Healthcare Staff Concerned with Red Nodes Overlay */}
        {stage === 'video1' && (
          <motion.div
            key="video1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full bg-black relative overflow-hidden"
          >
            {/* Video Background */}
            <video
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src="/videos/launch/video1.mp4"
            />

            {/* Dark overlay for better visibility */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Node Status Overlay - Top */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute top-0 left-0 right-0 z-20"
            >
              <div className="bg-gradient-to-b from-black/80 via-black/60 to-transparent py-8 px-8">
                <div className="max-w-7xl mx-auto">
                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-2xl md:text-3xl font-black text-red-400 mb-2">
                      INFECTION ALERT
                    </h2>
                    <p className="text-lg text-white/90 font-mono">
                      Critical situation detected across facilities
                    </p>
                  </motion.div>

                  {/* Node Status Line */}
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {['ER', 'ICU', 'Surgery', 'Pediatric', 'Gyne', 'Lab', 'Dialysis', 'Pharmacy'].map((node, index) => (
                      <motion.div
                        key={node}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: index <= activeNodeIndex ? 1 : 0.8,
                          opacity: index <= activeNodeIndex ? 1 : 0.3
                        }}
                        transition={{
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200
                        }}
                        className="flex flex-col items-center"
                      >
                        {/* Node Circle */}
                        <div className="relative">
                          <motion.div
                            animate={index <= activeNodeIndex ? {
                              boxShadow: [
                                "0 0 20px rgba(239, 68, 68, 0.3)",
                                "0 0 40px rgba(239, 68, 68, 0.6)",
                                "0 0 20px rgba(239, 68, 68, 0.3)"
                              ]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                              index <= activeNodeIndex
                                ? 'bg-red-500 border-red-400'
                                : 'bg-gray-700 border-gray-600'
                            }`}
                          >
                            {index <= activeNodeIndex && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-white text-xl"
                              >
                                ⚠️
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Pulsating ring effect for active nodes */}
                          {index <= activeNodeIndex && (
                            <motion.div
                              initial={{ scale: 1, opacity: 1 }}
                              animate={{
                                scale: [1, 2, 1],
                                opacity: [0.8, 0, 0.8]
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 2,
                                delay: index * 0.2
                              }}
                              className="absolute inset-0 rounded-full border-4 border-red-400"
                            />
                          )}
                        </div>

                        {/* Node Label */}
                        <span className={`mt-2 text-xs md:text-sm font-mono font-bold transition-colors duration-500 ${
                          index <= activeNodeIndex ? 'text-red-400' : 'text-gray-500'
                        }`}>
                          {node}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Video 2 - Resolution with Green Nodes Overlay */}
        {stage === 'video2' && (
          <motion.div
            key="video2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full bg-black relative overflow-hidden"
          >
            {/* Video Background */}
            <video
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src="/videos/launch/video2.mp4"
            />

            {/* Dark overlay for better visibility */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Node Status Overlay - Top */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute top-0 left-0 right-0 z-20"
            >
              <div className="bg-gradient-to-b from-black/80 via-black/60 to-transparent py-8 px-8">
                <div className="max-w-7xl mx-auto">
                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-2xl md:text-3xl font-black text-green-400 mb-2">
                      FASMAA ACTIVATED
                    </h2>
                    <p className="text-lg text-white/90 font-mono">
                      All facilities secured and monitored
                    </p>
                  </motion.div>

                  {/* Node Status Line */}
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {['ER', 'ICU', 'Surgery', 'Pediatric', 'Gyne', 'Lab', 'Dialysis', 'Pharmacy'].map((node, index) => (
                      <motion.div
                        key={node}
                        initial={{ scale: 0.8, opacity: 0.3 }}
                        animate={{
                          scale: index <= activeNodeIndex ? 1 : 0.8,
                          opacity: index <= activeNodeIndex ? 1 : 0.3
                        }}
                        transition={{
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200
                        }}
                        className="flex flex-col items-center"
                      >
                        {/* Node Circle */}
                        <div className="relative">
                          <motion.div
                            animate={index <= activeNodeIndex ? {
                              boxShadow: [
                                "0 0 20px rgba(74, 222, 128, 0.3)",
                                "0 0 40px rgba(74, 222, 128, 0.6)",
                                "0 0 20px rgba(74, 222, 128, 0.3)"
                              ]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                              index <= activeNodeIndex
                                ? 'bg-green-500 border-green-400'
                                : 'bg-gray-700 border-gray-600'
                            }`}
                          >
                            {index <= activeNodeIndex && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-white text-xl"
                              >
                                ✓
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Pulsating ring effect for active nodes */}
                          {index <= activeNodeIndex && (
                            <motion.div
                              initial={{ scale: 1, opacity: 1 }}
                              animate={{
                                scale: [1, 2, 1],
                                opacity: [0.8, 0, 0.8]
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 2,
                                delay: index * 0.2
                              }}
                              className="absolute inset-0 rounded-full border-4 border-green-400"
                            />
                          )}
                        </div>

                        {/* Node Label */}
                        <span className={`mt-2 text-xs md:text-sm font-mono font-bold transition-colors duration-500 ${
                          index <= activeNodeIndex ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {node}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* FASMAA Is Launching - Boot Sequence Style Countdown */}
        {stage === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
          >
            {/* Simple animated grid background */}
            <div className="absolute inset-0 opacity-[0.08]">
              <motion.div
                animate={{
                  backgroundPosition: ['0px 0px', '60px 60px']
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "linear"
                }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #4ECDC4 1px, transparent 1px),
                    linear-gradient(to bottom, #4ECDC4 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px'
                }}
              />
            </div>

            <div className="relative z-10 text-center max-w-4xl px-8">
              {/* FASMAA IS LAUNCHING */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-16"
              >
                <h2 className="text-6xl md:text-7xl font-black text-[#4ECDC4] mb-4 tracking-wider">
                  FASMAA
                </h2>
                <p className="text-3xl md:text-4xl font-light text-white tracking-widest">
                  IS LAUNCHING
                </p>
              </motion.div>

              {/* Boot sequence style loading messages */}
              <div className="space-y-4 font-mono text-left">
                {[
                  { time: "[    0.000000]", text: "Finalizing system initialization...", delay: 0.5 },
                  { time: "[    1.000000]", text: "Loading launch protocols...", delay: 1.5 },
                  { time: "[    2.000000]", text: "Activating surveillance grid...", delay: 2.5 },
                  { time: "[    3.000000]", text: "Establishing real-time connections...", delay: 3.5 },
                  { time: "[    4.000000]", text: "Launch sequence complete", delay: 4.5 }
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: msg.delay }}
                    className="flex items-center text-lg md:text-xl"
                  >
                    <span className="text-cyan-400 font-semibold mr-2">{msg.time}</span>
                    <span className="text-green-400">{msg.text}</span>
                    {i === 4 && (
                      <span className="ml-2 text-green-400 font-bold">[ OK ]</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Large countdown number */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="mt-16"
              >
                <AnimatePresence mode="wait">
                  {[5, 4, 3, 2, 1].map((num) => (
                    <motion.div
                      key={num}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-[8rem] font-black text-[#4ECDC4]"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {num === countdown && num}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* FASMAA Name Reveal - Two Lines, No Glow */}
        {stage === 'nameReveal' && (
          <motion.div
            key="nameReveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
          >
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.05]">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, #4ECDC4 1px, transparent 1px),
                  linear-gradient(to bottom, #4ECDC4 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }} />
            </div>

            <div className="relative z-10 text-center max-w-7xl px-8">
              {/* FASMAA letters expanding from center */}
              <div className="mb-16">
                <div className="flex items-center justify-center gap-6 mb-12">
                  {['F', 'A', 'S', 'M', 'A', 'A'].map((letter, index) => (
                    <motion.div
                      key={index}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{
                        delay: 0.2 + index * 0.1,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="origin-center"
                    >
                      <span className="text-[7rem] md:text-[9rem] font-black text-[#4ECDC4] leading-none block">
                        {letter}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Horizontal expanding line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="h-1 bg-gradient-to-r from-transparent via-[#4ECDC4] to-transparent mb-16 origin-center max-w-4xl mx-auto"
                />

                {/* Full name in two lines */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      delay: 1.6,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className="origin-center"
                  >
                    <p className="text-3xl md:text-4xl text-white font-light tracking-wide">
                      Facility Alert System for Microbial Monitoring
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      delay: 2.2,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className="origin-center"
                  >
                    <p className="text-3xl md:text-4xl text-white font-light tracking-wide">
                      and Antimicrobial Action
                    </p>
                  </motion.div>
                </div>

                {/* Bottom expanding line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 3.0, duration: 0.6 }}
                  className="h-1 bg-gradient-to-r from-transparent via-[#4ECDC4] to-transparent mt-16 origin-center max-w-4xl mx-auto"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Feature Showcase - Smooth Particle Animation */}
        {stage === 'features' && currentFeature > 0 && (
          <motion.div
            key="features-container"
            className="h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative"
          >
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.05]">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, #4ECDC4 1px, transparent 1px),
                  linear-gradient(to bottom, #4ECDC4 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }} />
            </div>

            {/* Particle effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`particle-${currentFeature}-${i}`}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    opacity: [0, 0.6, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                    delay: Math.random() * 0.5
                  }}
                  className="absolute w-2 h-2 bg-[#4ECDC4] rounded-full"
                />
              ))}
            </div>

            <div className="relative z-10 w-full max-w-7xl px-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`feature-content-${currentFeature}`}
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex flex-col items-center gap-12"
                >
                  {/* Feature Title */}
                  <motion.h2
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-6xl md:text-7xl font-black text-white text-center leading-tight"
                  >
                    {features[currentFeature - 1].title}
                  </motion.h2>

                  {/* Feature Icon - Custom PNG */}
                  <div className="w-full flex items-center justify-center min-h-[400px]">
                    <motion.div
                      initial={{ scale: 0, rotate: -180, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      <Image
                        src={features[currentFeature - 1].iconPath}
                        alt={features[currentFeature - 1].title}
                        width={500}
                        height={500}
                        className="drop-shadow-2xl"
                      />
                    </motion.div>
                  </div>

                  {/* Description */}
                  <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl text-[#4ECDC4] text-center max-w-4xl leading-relaxed"
                  >
                    {features[currentFeature - 1].description}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Phase 4: The Climax - Logo and Launch */}
        {stage === 'logo' && (
          <motion.div
            key="logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
          >
            {/* Subtle grid background */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, #4ECDC4 1px, transparent 1px),
                  linear-gradient(to bottom, #4ECDC4 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px'
              }} />
            </div>

            <div className="relative z-10 text-center space-y-12 max-w-6xl">
              {/* FASMAA Logo */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              >
                <motion.div
                  className="text-[10rem] md:text-[14rem] font-black text-[#4ECDC4] tracking-wider leading-none mb-8"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(78, 205, 196, 0.3)",
                      "0 0 40px rgba(78, 205, 196, 0.5)",
                      "0 0 20px rgba(78, 205, 196, 0.3)"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  FASMAA
                </motion.div>

                {/* Full name below */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-2xl md:text-3xl text-white font-light tracking-widest mb-12"
                >
                  Facility Alert System for Microbial Monitoring<br/>and Antimicrobial Action
                </motion.p>
              </motion.div>

              {/* Animated Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="h-1 w-96 bg-gradient-to-r from-transparent via-[#4ECDC4] to-transparent mx-auto"
              />

              {/* SYSTEM ONLINE Message */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="space-y-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-5xl md:text-6xl font-black text-white"
                >
                  SYSTEM ONLINE
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className="flex items-center justify-center space-x-4"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-4 h-4 bg-[#4ECDC4] rounded-full shadow-lg shadow-[#4ECDC4]/50"
                  />
                  <span className="text-2xl text-[#4ECDC4] font-mono">OFFICIALLY LAUNCHED</span>
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.75 }}
                    className="w-4 h-4 bg-[#4ECDC4] rounded-full shadow-lg shadow-[#4ECDC4]/50"
                  />
                </motion.div>
              </motion.div>

              {/* Platform Loading Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.5 }}
                className="mt-16 space-y-6 max-w-2xl mx-auto"
              >
                <div className="text-2xl text-white font-mono">
                  Loading Platform...
                </div>

                {/* Loading Bar */}
                <div className="w-full bg-slate-700/30 rounded-full h-4 overflow-hidden border border-[#4ECDC4]/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${platformLoadingProgress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#45B7D1] relative"
                  >
                    {/* Animated shine effect */}
                    <motion.div
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>

                {/* Percentage */}
                <div className="text-xl text-[#4ECDC4] font-mono font-bold">
                  {Math.round(platformLoadingProgress)}%
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="mt-16 space-y-4"
              >
                <p className="text-xl text-gray-400">
                  Securing Healthcare, Together
                </p>
                <p className="text-lg text-gray-500 font-mono">
                  Hulhumale Hospital IPC Committee
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smooth fade-out overlay when transitioning to dashboard */}
      <AnimatePresence>
        {isFadingOut && (
          <motion.div
            key="fadeout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 bg-black z-50"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LaunchSequence;
