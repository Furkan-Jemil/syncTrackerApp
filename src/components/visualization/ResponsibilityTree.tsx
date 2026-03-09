import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Task, Participant, SYNC_STATUS_COLORS } from '@/types';
import useSyncStore from '@/stores/syncStore';

interface ResponsibilityTreeProps {
  task: Task;
}

const { width } = Dimensions.get('window');
const NODE_RADIUS = 24;
const VERTICAL_SPACING = 100;

export default function ResponsibilityTree({ task }: ResponsibilityTreeProps) {
  const navigation = useNavigation<any>();
  const getTaskStatuses = useSyncStore(s => s.getTaskStatuses);
  const liveStatuses = getTaskStatuses(task.id);

  // Group participants by hierarchy level
  const hierarchy = useMemo(() => {
    // Level 0: The Task itself (rendered as root)
    // Level 1: Responsible Owner
    // Level 2: Contributors & Helpers
    // Level 3: Reviewers & Observers

    const responsible = task.participants.filter(p => p.role === 'RESPONSIBLE');
    const collaborators = task.participants.filter(p => p.role === 'CONTRIBUTOR' || p.role === 'HELPER');
    const observers = task.participants.filter(p => p.role === 'REVIEWER' || p.role === 'OBSERVER');

    return [
      responsible,
      collaborators,
      observers
    ].filter(level => level.length > 0);
  }, [task.participants]);

  const renderTree = () => {
    const nodes: any[] = [];
    const links: any[] = [];

    const centerX = width / 2;
    let currentY = 60; // Start below top

    // Root (Task) Node
    nodes.push({
      id: 'root-task',
      x: centerX,
      y: currentY,
      label: 'Task Goal',
      isRoot: true,
      color: '#5a6ff4'
    });

    let prevLevelNodes = [nodes[0]];

    hierarchy.forEach((levelParticipants, levelIndex) => {
      currentY += VERTICAL_SPACING;
      const levelNodes: any[] = [];
      const totalInLevel = levelParticipants.length;
      
      // Calculate horizontal spread. Max 3-4 nodes per row nicely, else it gets crowded.
      const spread = Math.min(width - 40, totalInLevel * 100); 
      const startX = centerX - (spread / 2) + (spread / (totalInLevel * 2));

      levelParticipants.forEach((p, i) => {
        const x = startX + (i * (spread / totalInLevel));
        const syncStatus = liveStatuses[p.userId] || p.syncStatus;
        const color = SYNC_STATUS_COLORS[syncStatus] || '#fff';
        
        const node = {
          id: p.id,
          participant: p,
          x,
          y: currentY,
          label: p.user?.name || `User ${p.userId.substring(0,4)}`,
          color,
        };
        
        levelNodes.push(node);
        nodes.push(node);

        // Draw links to previous level (simplified: connect all to first node of prev level, or closest)
        // For a true hierarchical tree, we'd map specific parenthood. Here, we fan out from the top.
        // If it's the responsible owner, they connect to root.
        // If it's a contributor, connect to responsible owner (prevLevelNodes[0] usually).
        const parentNode = prevLevelNodes.length === 1 
          ? prevLevelNodes[0] 
          : prevLevelNodes[Math.min(i, prevLevelNodes.length - 1)];

        links.push({
          id: `link-${parentNode.id}-${node.id}`,
          x1: parentNode.x,
          y1: parentNode.y + NODE_RADIUS,
          x2: node.x,
          y2: node.y - NODE_RADIUS,
        });
      });

      prevLevelNodes = levelNodes;
    });

    return { nodes, links };
  };

  const { nodes, links } = renderTree();

  const handleNodePress = (node: any) => {
    if (node.isRoot) return;
    navigation.navigate('UserSidePanel', {
      userId: node.participant.userId,
      name: node.participant.user?.name || `User ${node.participant.userId.substring(0,4)}`,
      role: node.participant.role,
      syncStatus: liveStatuses[node.participant.userId] || node.participant.syncStatus,
      lastUpdated: node.participant.lastSyncAt || node.participant.updatedAt || new Date().toISOString(),
      timeLogged: node.participant.totalTimeLogged || 0,
      milestonesCompleted: 0,
    });
  };

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill}>
        {/* Draw Links */}
        {links.map(link => (
          <Line
            key={link.id}
            x1={link.x1}
            y1={link.y1}
            x2={link.x2}
            y2={link.y2}
            stroke="#1e2240"
            strokeWidth="2"
          />
        ))}

        {/* Draw Nodes */}
        {nodes.map(node => (
          <G 
            key={node.id} 
            onPress={() => handleNodePress(node)}
            x={node.x}
            y={node.y}
          >
            <Circle
              cx={0}
              cy={0}
              r={NODE_RADIUS}
              fill="#1a1d27"
              stroke={node.color}
              strokeWidth="3"
            />
            <SvgText
              x={0}
              y={5}
              fill="#f0f4ff"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              {node.isRoot ? 'T' : node.label.charAt(0).toUpperCase()}
            </SvgText>
            <SvgText
              x={0}
              y={NODE_RADIUS + 16}
              fill="#a0aabe"
              fontSize="12"
              textAnchor="middle"
            >
              {node.label.split(' ')[0]}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
});
