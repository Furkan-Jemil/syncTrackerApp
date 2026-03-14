import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, Dimensions, Pressable } from "react-native";
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  G,
  Polygon,
} from "react-native-svg";
import * as d3 from "d3-force";
import { useNavigation } from "@react-navigation/native";
import { Task, SYNC_STATUS_COLORS, ROLE_COLORS } from "@/types";
import useSyncStore from "@/stores/syncStore";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";

const AnimatedGNode = Animated.createAnimatedComponent(G);
const AnimatedCircleNode = Animated.createAnimatedComponent(Circle);
const AnimatedLineNode = Animated.createAnimatedComponent(Line);

interface SyncGraphProps {
  task: Task;
}

const { width } = Dimensions.get("window");
const HEIGHT = 400; // Fixed height for the graph container
const NODE_RADIUS = 20;

export default function SyncGraph({ task }: SyncGraphProps) {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const getTaskStatuses = useSyncStore((s) => s.getTaskStatuses);
  const liveStatuses = getTaskStatuses(task.id);

  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  // Construct initial graph data
  const { initialNodes, initialLinks } = useMemo(() => {
    const nds: any[] = [];
    const lnks: any[] = [];

    // Central Task Node
    nds.push({
      id: "root-task",
      label: "Task",
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

      // Link everyone from the central task so arrows flow outward
      lnks.push({
        source: "root-task",
        target: p.userId,
        distance: 100,
        color: ROLE_COLORS[p.role as keyof typeof ROLE_COLORS] || "#888",
      });

      // Simple cluster rules: Contributors link to Responsible owner
      if (p.role === "CONTRIBUTOR" || p.role === "HELPER") {
        const owner = (task?.participants || []).find(
          (pt) => pt.role === "RESPONSIBLE",
        );
        if (owner) {
          lnks.push({
            source: owner.userId, // arrow flows from owner -> contributor
            target: p.userId,
            distance: 60,
            color: ROLE_COLORS[p.role as keyof typeof ROLE_COLORS] || "#888",
          });
        }
      }
    });

    return { initialNodes: nds, initialLinks: lnks };
  }, [task, width]);

  // Run d3-force simulation
  useEffect(() => {
    // Clone to avoid mutating React state
    const simulationNodes = initialNodes.map((d) => ({ ...d }));
    const simulationLinks = initialLinks.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(simulationNodes)
      .force(
        "link",
        d3
          .forceLink(simulationLinks)
          .id((d: any) => d.id)
          .distance((d: any) => d.distance || 100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, HEIGHT / 2))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d: any) => d.radius + 10)
          .iterations(2),
      );

    // Run simulation synchronously for 300 ticks to get a stable layout instantly
    simulation.tick(300);
    simulation.stop();

    setNodes(simulationNodes);
    setLinks(simulationLinks);
  }, [initialNodes, initialLinks, width]);

  const handleNodePress = (node: any) => {
    if (node.isRoot) return;
    navigation.navigate("UserSidePanel", {
      taskId: task.id,
      userId: node.id,
      name: node.participant.user?.name || "User",
      role: node.participant.role,
      syncStatus: liveStatuses[node.id] || node.participant.syncStatus,
      lastUpdated:
        node.participant.lastSyncAt ||
        node.participant.updatedAt ||
        new Date().toISOString(),
      timeLogged: node.participant.totalTimeLogged || 0,
      milestonesCompleted: 0,
    });
  };

  // shared value for container animation
  const containerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  const handleContainerPress = () => {
    containerScale.value = withSequence(
      withTiming(1.1, { duration: 150 }),
      withSpring(1),
    );
  };

  // animate in on mount
  useEffect(() => {
    containerScale.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
    containerOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  return (
    <Pressable onPress={handleContainerPress} style={styles.flex}>
      <Animated.View style={[styles.container, containerStyle, { backgroundColor: theme.background }]}>
        {nodes.length > 0 && (
          <Svg style={StyleSheet.absoluteFill}>
            {/* Draw Links */}
            {links.map((link, i) => (
              <AnimatedLink key={`link-${i}`} link={link} />
            ))}

            {/* Draw Nodes */}
            {nodes.map((node) => (
              <GraphNode
                key={node.id}
                node={node}
                liveStatus={liveStatuses[node.id]}
                onPress={() => handleNodePress(node)}
              />
            ))}
          </Svg>
        )}
      </Animated.View>
    </Pressable>
  );
}

function AnimatedLink({ link }: any) {
  const theme = useAppTheme();
  const dashOffset = useSharedValue(0);

  useEffect(() => {
    dashOffset.value = withRepeat(
      withTiming(-30, { duration: 800, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const color = link.color || theme.border;
  // handle cases where source/target may be plain ids (strings)
  const sourceId =
    typeof link.source === "object" ? link.source.id : link.source;
  const targetId =
    typeof link.target === "object" ? link.target.id : link.target;
  const sourceStatus =
    typeof link.source === "object" ? link.source.status : null;
  const isDashed =
    (sourceId !== "root-task" && targetId !== "root-task") ||
    sourceStatus === "PENDING";

  // compute arrowhead points manually
  const arrowSize = 8;
  const dx = link.target.x - link.source.x;
  const dy = link.target.y - link.source.y;
  const angle = Math.atan2(dy, dx);
  const x2 = link.target.x;
  const y2 = link.target.y;
  const x3 = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
  const y3 = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
  const x4 = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
  const y4 = y2 - arrowSize * Math.sin(angle + Math.PI / 6);

  return (
    <>
      <AnimatedLineNode
        x1={link.source.x}
        y1={link.source.y}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="4"
        strokeDasharray={isDashed ? "6,6" : "12,4"}
        animatedProps={animatedProps}
      />
      {/* arrowhead triangle */}
      <Polygon points={`${x2},${y2} ${x3},${y3} ${x4},${y4}`} fill={color} />
    </>
  );
}

function GraphNode({ node, liveStatus, onPress }: any) {
  const theme = useAppTheme();
  const syncStatus = node.participant
    ? liveStatus || node.participant.syncStatus
    : "IN_SYNC";
  const isPending = node.participant?.status === "PENDING";
  const baseColor = node.isRoot
    ? theme.primary
    : isPending
      ? theme.border
      : ROLE_COLORS[node.participant?.role as keyof typeof ROLE_COLORS] ||
        SYNC_STATUS_COLORS[syncStatus as keyof typeof SYNC_STATUS_COLORS] ||
        "#fff";

  const pulse = useSharedValue(1);

  useEffect(() => {
    // Pulsing effect for focused or problematic nodes
    if (
      syncStatus === "BLOCKED" ||
      syncStatus === "HELP_REQUESTED" ||
      node.isRoot
    ) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
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
    <AnimatedGNode x={node.x} y={node.y} onPress={onPress}>
      <AnimatedGNode animatedProps={animatedGProps}>
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
          fill={theme.surface}
          stroke={baseColor}
          strokeWidth="3"
          strokeDasharray={isPending ? "4,4" : "0"}
          opacity={isPending ? 0.6 : 1}
        />
        <SvgText
          x={0}
          y={5}
          fill={isPending ? theme.textSecondary : theme.text}
          fontSize={node.isRoot ? 14 : 16}
          fontWeight="bold"
          textAnchor="middle">
          {node.isRoot ? "T" : node.label.charAt(0).toUpperCase()}
        </SvgText>
      </AnimatedGNode>
      <SvgText
        x={0}
        y={node.radius + 16}
        fill={theme.textSecondary}
        fontSize="11"
        textAnchor="middle">
        {node.isRoot ? "" : node.label.split(" ")[0]}
      </SvgText>
    </AnimatedGNode>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    height: HEIGHT,
    overflow: "hidden",
  },
});
