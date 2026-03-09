import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import * as d3 from 'd3-force';
import { useNavigation } from '@react-navigation/native';
import { Task, SYNC_STATUS_COLORS } from '@/types';
import useSyncStore from '@/stores/syncStore';

interface SyncGraphProps {
  task: Task;
}

const { width } = Dimensions.get('window');
const HEIGHT = 400; // Fixed height for the graph container
const NODE_RADIUS = 20;

export default function SyncGraph({ task }: SyncGraphProps) {
  const navigation = useNavigation<any>();
  const getTaskStatuses = useSyncStore(s => s.getTaskStatuses);
  const liveStatuses = getTaskStatuses(task.id);

  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  // Construct initial graph data
  const { initialNodes, initialLinks } = useMemo(() => {
    const nds: any[] = [];
    const lnks: any[] = [];

    // Central Task Node
    nds.push({
      id: 'root-task',
      label: 'Task',
      isRoot: true,
      radius: NODE_RADIUS * 1.5,
      // Fix task node to center
      fx: width / 2,
      fy: HEIGHT / 2,
    });

    task.participants.forEach((p) => {
      nds.push({
        id: p.userId,
        participant: p,
        label: p.user?.name || `User`,
        radius: NODE_RADIUS,
      });

      // Link everyone to the central task for gravity
      lnks.push({
        source: p.userId,
        target: 'root-task',
        distance: 100,
      });

      // Simple cluster rules: Contributors link to Responsible owner
      if (p.role === 'CONTRIBUTOR' || p.role === 'HELPER') {
        const owner = task.participants.find(pt => pt.role === 'RESPONSIBLE');
        if (owner) {
          lnks.push({
            source: p.userId,
            target: owner.userId,
            distance: 60,
          });
        }
      }
    });

    return { initialNodes: nds, initialLinks: lnks };
  }, [task]);

  // Run d3-force simulation
  useEffect(() => {
    // Clone to avoid mutating React state
    const simulationNodes = initialNodes.map(d => ({ ...d }));
    const simulationLinks = initialLinks.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(simulationNodes)
      .force('link', d3.forceLink(simulationLinks).id((d: any) => d.id).distance((d: any) => d.distance || 100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, HEIGHT / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 10).iterations(2));

    // Run simulation synchronously for 300 ticks to get a stable layout instantly
    simulation.tick(300);
    simulation.stop();

    setNodes(simulationNodes);
    setLinks(simulationLinks);
  }, [initialNodes, initialLinks]);

  const handleNodePress = (node: any) => {
    if (node.isRoot) return;
    navigation.navigate('UserSidePanel', {
      userId: node.id,
      name: node.participant.user?.name || 'User',
      role: node.participant.role,
      syncStatus: liveStatuses[node.id] || node.participant.syncStatus,
      lastUpdated: node.participant.lastSyncAt || node.participant.updatedAt || new Date().toISOString(),
      timeLogged: node.participant.totalTimeLogged || 0,
      milestonesCompleted: 0,
    });
  };

  return (
    <View style={styles.container}>
      {nodes.length > 0 && (
        <Svg style={StyleSheet.absoluteFill}>
          {/* Draw Links */}
          {links.map((link, i) => (
            <Line
              key={`link-${i}`}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke="#1e2240"
              strokeWidth="2"
              strokeDasharray={link.source.id !== 'root-task' && link.target.id !== 'root-task' ? '5,5' : ''}
            />
          ))}

          {/* Draw Nodes */}
          {nodes.map(node => {
            const syncStatus = node.participant ? (liveStatuses[node.id] || node.participant.syncStatus) : 'IN_SYNC';
            const color = node.isRoot ? '#5a6ff4' : (SYNC_STATUS_COLORS[syncStatus] || '#fff');
            
            return (
              <G 
                key={node.id}
                x={node.x}
                y={node.y}
                onPress={() => handleNodePress(node)}
              >
                <Circle
                  cx={0}
                  cy={0}
                  r={node.radius}
                  fill="#1a1d27"
                  stroke={color}
                  strokeWidth={node.isRoot ? 0 : 3}
                />
                <SvgText
                  x={0}
                  y={5}
                  fill="#f0f4ff"
                  fontSize={node.isRoot ? 14 : 16}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {node.isRoot ? 'T' : node.label.charAt(0).toUpperCase()}
                </SvgText>
                <SvgText
                  x={0}
                  y={node.radius + 16}
                  fill="#a0aabe"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {node.isRoot ? '' : node.label.split(' ')[0]}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    backgroundColor: '#0f1117',
    overflow: 'hidden',
  },
});
