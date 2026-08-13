import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Package, Truck, Wrench, Box, ArrowRightLeft } from "lucide-react";
import { MOCK_RESOURCE_DONUT } from "../../data/mockDashboard";
import { DashboardPanel } from "../admin/DashboardPanel";
import { useCountUp } from "../../hooks/useCountUp";

const LEGEND_ICONS: Record<string, React.ElementType> = {
  Available: Box,
  "In Transit": ArrowRightLeft,
  Deployed: Truck,
  Maintenance: Wrench,
};

const TOTAL_UNITS = 320;
const ACTIVE_FIELD = 278;
const STANDBY = 42;

export function ResourceDonutChart() {
  const uid = useId().replace(/:/g, "");
  const stageRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const deployed = MOCK_RESOURCE_DONUT.find((d) => d.name === "Deployed")?.value ?? 87;
  const totalSegments = MOCK_RESOURCE_DONUT.reduce((s, d) => s + d.value, 0);

  const deployedDisplay = useCountUp(deployed, 1600, visible);
  const totalDisplay = useCountUp(TOTAL_UNITS, 1500, visible);
  const activeDisplay = useCountUp(ACTIVE_FIELD, 1700, visible);
  const standbyDisplay = useCountUp(STANDBY, 1300, visible);

  const legend = useMemo(
    () =>
      MOCK_RESOURCE_DONUT.map((item) => ({
        ...item,
        units: Math.round((item.value / totalSegments) * TOTAL_UNITS),
        pct: Math.round((item.value / totalSegments) * 100),
      })),
    [totalSegments]
  );

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <DashboardPanel
      icon={Package}
      iconTheme="blue"
      title="Resource Status"
      subtitle="Virtual fleet deployment matrix"
      className="dashboard-panel--virtual"
      bodyClassName="virtual-resource-body"
    >
      <div
        ref={stageRef}
        className={`virtual-chart-stage${visible ? " virtual-chart-stage--live" : ""}`}
      >
        <div className="virtual-chart-radial-beams" aria-hidden />
        <div className="virtual-chart-grid" aria-hidden />
        <div className="virtual-chart-ticks" aria-hidden />
        <div className="virtual-chart-orbit virtual-chart-orbit--a" aria-hidden />
        <div className="virtual-chart-orbit virtual-chart-orbit--b" aria-hidden />
        <div className="virtual-chart-ring virtual-chart-ring--outer" aria-hidden />
        <div className="virtual-chart-ring virtual-chart-ring--inner" aria-hidden />
        <div className="virtual-chart-scan" aria-hidden />
        <div className="virtual-chart-glow" aria-hidden />

        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <defs>
              {MOCK_RESOURCE_DONUT.map((e, i) => (
                <linearGradient key={i} id={`${uid}-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={e.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={e.color} stopOpacity={0.62} />
                </linearGradient>
              ))}
              <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={86}
              dataKey="value"
              stroke="transparent"
              fill="var(--virtual-track)"
              isAnimationActive={false}
            />
            <Pie
              data={MOCK_RESOURCE_DONUT}
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={84}
              paddingAngle={3}
              dataKey="value"
              stroke="transparent"
              isAnimationActive={visible}
              animationDuration={1400}
              animationEasing="ease-out"
              activeIndex={activeIndex}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {MOCK_RESOURCE_DONUT.map((entry, i) => (
                <Cell
                  key={i}
                  fill={`url(#${uid}-grad-${i})`}
                  style={{
                    filter: activeIndex === i ? `url(#${uid}-glow)` : undefined,
                    opacity: activeIndex === undefined || activeIndex === i ? 1 : 0.38,
                    transition: "opacity 0.28s ease, filter 0.28s ease",
                    transformOrigin: "center center",
                  }}
                  className={activeIndex === i ? "virtual-chart-segment--active" : undefined}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="virtual-chart-hub">
          <p className="virtual-chart-hub__value">{deployedDisplay}%</p>
          <p className="virtual-chart-hub__label">Deployed</p>
          <span className="virtual-chart-hub__pulse virtual-chart-hub__pulse--a" aria-hidden />
          <span className="virtual-chart-hub__pulse virtual-chart-hub__pulse--b" aria-hidden />
        </div>
      </div>

      <div className="virtual-legend-grid">
        {legend.map((item, index) => {
          const Icon = LEGEND_ICONS[item.name] ?? Box;
          return (
            <div
              key={item.name}
              className={`virtual-legend-chip${activeIndex === index ? " virtual-legend-chip--active" : ""}`}
              style={
                {
                  "--chip-color": item.color,
                  "--chip-delay": `${index * 90}ms`,
                } as React.CSSProperties
              }
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div className="virtual-legend-chip__icon">
                <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="virtual-legend-chip__name">{item.name}</p>
                <p className="virtual-legend-chip__meta">{item.units} units · {item.pct}%</p>
              </div>
              <span className="virtual-legend-chip__dot" />
            </div>
          );
        })}
      </div>

      <div className="virtual-stat-pills">
        <div className="virtual-stat-pill">
          <p className="virtual-stat-pill__value">{totalDisplay}</p>
          <p className="virtual-stat-pill__label">Total</p>
        </div>
        <div className="virtual-stat-pill virtual-stat-pill--green">
          <p className="virtual-stat-pill__value">{activeDisplay}</p>
          <p className="virtual-stat-pill__label">Active</p>
        </div>
        <div className="virtual-stat-pill">
          <p className="virtual-stat-pill__value">{standbyDisplay}</p>
          <p className="virtual-stat-pill__label">Standby</p>
        </div>
      </div>
    </DashboardPanel>
  );
}
