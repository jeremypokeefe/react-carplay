import { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { connect } from 'mqtt';
import { SensorPosition } from '../types';

import './App.css';

import Settings from './components/Settings';
import WarningOverlay from './components/WarningOverlay';
import Info from './components/Info';
import Home from './components/Home';
import Nav from './components/Nav';
import Carplay from './components/Carplay';
import Camera from './components/Camera';
import { Box, Modal } from '@mui/material';
import { useCarplayStore, useStatusStore } from './store/store';

const MQTT_BROKER = 'ws://192.168.1.100:1883'; // Use ws://<IP>:1883 for remote Pi

// Use contextBridge API instead of direct require
const { ipcRenderer } = window.electron;

const logWarning = (position: SensorPosition) => {
  ipcRenderer.send('log-warning', position);
};

// rm -rf node_modules/.vite; npm run dev

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  height: '95%',
  width: '95%',
  boxShadow: 24,
  display: 'flex'
};

function App() {
  const [receivingVideo, setReceivingVideo] = useState(false);
  const [commandCounter, setCommandCounter] = useState(0);
  const [keyCommand, setKeyCommand] = useState('');
  const [reverse, setReverse] = useStatusStore((state) => [state.reverse, state.setReverse]);
  const [activeWarnings, setActiveWarnings] = useState<SensorPosition[]>([]);
  const [testMode, setTestMode] = useState(true);

  const settings = useCarplayStore((state) => state.settings);

  const playWarningSound = () => {
    const audio = new Audio('/sonar.mp3');
    audio.volume = 0.7;
    audio.play().catch(console.error);
  };

  useEffect(() => {
    if (testMode) return;

    const client = connect(MQTT_BROKER);

    const topics: SensorPosition[] = ['FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT'];

    client.on('connect', () => {
      topics.forEach((pos) => client.subscribe(`car/sensor/${pos.toLowerCase()}`));
    });

    client.on('message', (topic, message) => {
      const sensor = topic.split('/').pop()?.toUpperCase() as SensorPosition;
      if (message.toString() === 'WARNING' && sensor) {
        setActiveWarnings((prev) => {
          if (!prev.includes(sensor)) {
            playWarningSound();
            logWarning(sensor);
            return [...prev, sensor];
          }
          return prev;
        });

        // Clear the warning after 2 seconds
        setTimeout(() => {
          setActiveWarnings((prev) => prev.filter((pos) => pos !== sensor));
        }, 2000);
      }
    });

    return () => {
      client.end();
    };
  }, [testMode]);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [settings]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (Object.values(settings!.bindings).includes(event.code)) {
      let action = Object.keys(settings!.bindings).find(
        (key) => settings!.bindings[key] === event.code
      );
      console.log(action);
      if (action !== undefined) {
        setKeyCommand(action);
        setCommandCounter((prev) => prev + 1);
        if (action === 'selectDown') {
          console.log('select down');
          setTimeout(() => {
            setKeyCommand('selectUp');
            setCommandCounter((prev) => prev + 1);
          }, 200);
        }
      }
    }
  };

  return (
    <Router>
      <div style={{ height: '100%', touchAction: 'none' }} id={'main'} className="App">
        <WarningOverlay activePositions={activeWarnings} testMode={testMode} />
        <Nav receivingVideo={receivingVideo} settings={settings} />
        {settings ? (
          <Carplay
            receivingVideo={receivingVideo}
            setReceivingVideo={setReceivingVideo}
            settings={settings}
            command={keyCommand}
            commandCounter={commandCounter}
          />
        ) : null}
        <Routes>
          <Route path={'/'} element={<Home />} />
          <Route path={'/settings'} element={<Settings settings={settings!} />} />
          <Route path={'/info'} element={<Info />} />
          <Route path={'/camera'} element={<Camera settings={settings!} />} />
        </Routes>
        <Modal open={reverse} onClick={() => setReverse(false)}>
          <Box sx={style}>
            <Camera settings={settings} />
          </Box>
        </Modal>
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            color: '#0f0',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}
        >
          <div>Active Warnings: {activeWarnings.join(', ') || 'None'}</div>
          <div>Test Mode: {testMode ? 'ON' : 'OFF'}</div>
        </div>

        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 9999 }}>
          <label style={{ color: 'white', fontWeight: 'bold' }}>
            <input type="checkbox" checked={testMode} onChange={() => setTestMode(!testMode)} />
            Test Mode
          </label>
        </div>
      </div>
    </Router>
  );
}

export default App;
