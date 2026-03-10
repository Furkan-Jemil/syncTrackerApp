import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import * as d3 from 'd3-force';
import { useNavigation } from '@react-navigation/native';
import { Task, SYNC_STATUS_COLORS, ROLE_COLORS } from '@/types';
import useSyncStore from '@/stores/syncStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps,
  withRepeat, 
  withTiming, 
  withSequence, 
  withSpring,
  Easing 
} from 'react-native-reanimated';

const AnimatedGNode = Animated.createAnimatedComponent(G);
const AnimatedCircleNode = Animated.createAnimatedComponent(Circle);
const AnimatedLineNode = Animated.createAnimatedComponent(Line);

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

    (task?.participants || []).forEach((p) => {
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
        const owner = (task?.participants || []).find(pt => pt.role === 'RESPONSIBLE');
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
  }, [task, width]);

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
  }, [initialNodes, initialLinks, width]);

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
            <AnimatedLink
              key={`link-${i}`}
              link={link}
            />
          ))}

          {/* Draw Nodes */}
          {nodes.map(node => (
            <GraphNode 
              key={node.id}
              node={node}
              liveStatus={liveStatuses[node.id]}
              onPress={() => handleNodePress(node)}
            />
          ))}
        </Svg>
      )}
    </View>
  );
}

function AnimatedLink({ link }: any) {
  const dashOffset = useSharedValue(0);

  useEffect(() => {
    dashOffset.value = withRepeat(
      withTiming(-20, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const isDashed = (link.source.id !== 'root-task' && link.target.id !== 'root-task') || link.source.status === 'PENDING';

  return (
    <AnimatedLineNode
      x1={link.source.x}
      y1={link.source.y}
      x2={link.target.x}
      y2={link.target.y}
      stroke={link.source.status === 'PENDING' ? '#3F3F46' : '#27272A'}
      strokeWidth="2"
      strokeDasharray={isDashed ? "5,5" : "10,5"}
      animatedProps={animatedProps}
    />
  );
}

function GraphNode({ node, liveStatus, onPress }: any) {
  const syncStatus = node.participant ? (liveStatus || node.participant.syncStatus) : 'IN_SYNC';
  const isPending = node.participant?.status === 'PENDING';
  const baseColor = node.isRoot 
    ? '#A3E635' 
    : isPending 
      ? '#3F3F46' 
      : (ROLE_COLORS[node.participant?.role as keyof typeof ROLE_COLORS] || SYNC_STATUS_COLORS[syncStatus as keyof typeof SYNC_STATUS_COLORS] || '#fff');
  
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Pulsing effect for focused or problematic nodes
    if (syncStatus === 'BLOCKED' || syncStatus === 'HELP_REQUESTED' || node.isRoot) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
       pulse.value = withSpring(1);
    }
  }, [syncStatus]);

  const animatedCircleProps = useAnimatedProps(() => ({
    r: node.radius + 4 * pulse.value,
    opacity: pulse.value > 1.1 ? 0.8 : 1,
  }));

  const animatedGProps = useAnimatedProps(() => ({
    transform: [{ scale: pulse.value > 1.1 ? 1.05 : 1 }],
  }));

  return (
    <AnimatedGNode 
      x={node.x}
      y={node.y}
      onPress={onPress}
    >
      <AnimatedGNode 
        animatedProps={animatedGProps}
      >
        {/* Outer Glow Ring */}
        <AnimatedCircleNode
          cx={0}
          cy={0}
          fill="transparent"
          stroke={baseColor}
          strokeWidth="2"
          strokeDasharray={isPending ? "4,4" : "0"}
          animatedProps={animatedCircleProps}
        />
        <Circle
          cx={0}
          cy={0}
          r={node.radius}
          fill="#18181B"
          stroke={baseColor}
          strokeWidth="3"
          strokeDasharray={isPending ? "4,4" : "0"}
          opacity={isPending ? 0.6 : 1}
        />
        <SvgText
          x={0}
          y={5}
          fill={isPending ? '#52525B' : '#F8FAFC'}
          fontSize={node.isRoot ? 14 : 16}
          fontWeight="bold"
          textAnchor="middle"
        >
          {node.isRoot ? 'T' : node.label.charAt(0).toUpperCase()}
        </SvgText>
      </AnimatedGNode>
      <SvgText
        x={0}
        y={node.radius + 16}
        fill="#A1A1AA"
        fontSize="11"
        textAnchor="middle"
      >
        {node.isRoot ? '' : node.label.split(' ')[0]}
      </SvgText>
    </AnimatedGNode>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    backgroundColor: '#09090B',
    overflow: 'hidden',
  },
});
