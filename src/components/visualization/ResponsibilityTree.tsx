import React, { useMemo, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Line, Circle, Text as SvgText, G } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { Task, SYNC_STATUS_COLORS, ROLE_COLORS } from "@/types";
import useSyncStore from "@/stores/syncStore";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  useAnimatedProps,
  withRepeat,
  Easing,
  withSpring,
} from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ResponsibilityTreeProps {
  task: Task;
}

const { width } = Dimensions.get("window");
const NODE_RADIUS = 24;
const VERTICAL_SPACING = 100;

export default function ResponsibilityTree({ task }: ResponsibilityTreeProps) {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const getTaskStatuses = useSyncStore((s) => s.getTaskStatuses);
  const liveStatuses = getTaskStatuses(task.id);

  const hierarchy = useMemo(() => {
    const participantsList = task?.participants || [];
    const responsible = participantsList.filter(
      (p) => p.role === "RESPONSIBLE",
    );
    const collaborators = participantsList.filter(
      (p) => p.role === "CONTRIBUTOR" || p.role === "HELPER",
    );
    const observers = participantsList.filter(
      (p) => p.role === "REVIEWER" || p.role === "OBSERVER",
    );

    return [responsible, collaborators, observers].filter(
      (level) => level.length > 0,
    );
  }, [task]);

  const treeData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const centerX = width / 2;
    let currentY = 60;

    nodes.push({
      id: "root-task",
      x: centerX,
      y: currentY,
      label: "Task Goal",
      isRoot: true,
      color: theme.primary,
      level: 0,
    });

    let prevLevelNodes = [nodes[0]];

    hierarchy.forEach((levelParticipants, levelIndex) => {
      currentY += VERTICAL_SPACING;
      const levelNodes: any[] = [];
      const totalInLevel = levelParticipants.length;
      const spread = Math.min(width - 40, totalInLevel * 100);
      const startX = centerX - spread / 2 + spread / (totalInLevel * 2);

      levelParticipants.forEach((p, i) => {
        const x = startX + i * (spread / totalInLevel);
        const syncStatus = liveStatuses[p.userId] || p.syncStatus;
        const isPending = p.status === "PENDING";
        const color = isPending
          ? theme.border
          : ROLE_COLORS[p.role as keyof typeof ROLE_COLORS] ||
            SYNC_STATUS_COLORS[syncStatus as keyof typeof SYNC_STATUS_COLORS] ||
            "#fff";

        const node = {
          id: p.id,
          participant: p,
          x,
          y: currentY,
          label: p.user?.name || `User`,
          color,
          isPending,
          level: levelIndex + 1,
        };

        levelNodes.push(node);
        nodes.push(node);

        const parentNode =
          prevLevelNodes.length === 1
            ? prevLevelNodes[0]
            : prevLevelNodes[Math.min(i, prevLevelNodes.length - 1)];

        links.push({
          id: `link-${parentNode.id}-${node.id}`,
          x1: parentNode.x,
          y1: parentNode.y + NODE_RADIUS,
          x2: node.x,
          y2: node.y - NODE_RADIUS,
          isPending: node.isPending,
          level: levelIndex + 1,
        });
      });

      prevLevelNodes = levelNodes;
    });

    return { nodes, links };
  }, [hierarchy, liveStatuses]);

  const handleNodePress = (node: any) => {
    if (node.isRoot) return;
    navigation.navigate("UserSidePanel", {
      taskId: task.id,
      userId: node.participant.userId,
      name: node.participant.user?.name || "User",
      role: node.participant.role,
      syncStatus:
        liveStatuses[node.participant.userId] || node.participant.syncStatus,
      lastUpdated:
        node.participant.lastSyncAt ||
        node.participant.updatedAt ||
        new Date().toISOString(),
      timeLogged: node.participant.totalTimeLogged || 0,
      milestonesCompleted: 0,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Svg style={StyleSheet.absoluteFill}>
        {treeData.links.map((link, i) => (
          <TreeNodeConnector key={link.id} link={link} index={i} />
        ))}
        {treeData.nodes.map((node, i) => (
          <TreeNode
            key={node.id}
            node={node}
            index={i}
            onPress={() => handleNodePress(node)}
          />
        ))}
      </Svg>
    </View>
  );
}

function TreeNodeConnector({ link, index }: any) {
  const theme = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(index * 100, withTiming(1, { duration: 800 }));
  }, [link.id]);

  const animatedProps = useAnimatedProps(() => ({
    x2: link.x1 + (link.x2 - link.x1) * progress.value,
    y2: link.y1 + (link.y2 - link.y1) * progress.value,
    opacity: progress.value,
  }));

  return (
    <AnimatedLine
      x1={link.x1}
      y1={link.y1}
      stroke={link.isPending ? theme.border : theme.surface}
      strokeWidth="2"
      strokeDasharray={link.isPending ? "4,4" : "0"}
      animatedProps={animatedProps}
    />
  );
}

function TreeNode({ node, index, onPress }: any) {
  const theme = useAppTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 150, withSpring(1));
    opacity.value = withDelay(index * 150, withTiming(1));
  }, [node.id]);

  const animatedProps = useAnimatedProps(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedG animatedProps={animatedProps}>
      <G x={node.x} y={node.y}>
        <Circle
          cx={0}
          cy={0}
          r={NODE_RADIUS}
          fill={theme.surface}
          stroke={node.color}
          strokeWidth="3"
          strokeDasharray={node.isPending ? "4,4" : "0"}
          opacity={node.isPending ? 0.6 : 1}
        />
        <SvgText
          x={0}
          y={5}
          fill={node.isPending ? theme.textMuted : theme.text}
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle">
          {node.isRoot ? "T" : node.label.charAt(0).toUpperCase()}
        </SvgText>
        <SvgText
          x={0}
          y={NODE_RADIUS + 16}
          fill={theme.textSecondary}
          fontSize="12"
          textAnchor="middle">
          {node.label.split(" ")[0]}
        </SvgText>
      </G>
    </AnimatedG>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
