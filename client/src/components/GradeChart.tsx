import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GradeChartProps {
  labels: string[];
  data: number[];
}

export default function GradeChart({ labels, data }: GradeChartProps) {
  const chartData: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Number of Students",
        data,
        backgroundColor: [
          "rgba(76, 175, 80, 0.5)",
          "rgba(33, 150, 243, 0.5)",
          "rgba(255, 152, 0, 0.5)",
          "rgba(244, 67, 54, 0.5)",
          "rgba(158, 158, 158, 0.5)"
        ],
        borderColor: [
          "rgba(76, 175, 80, 1)",
          "rgba(33, 150, 243, 1)",
          "rgba(255, 152, 0, 1)",
          "rgba(244, 67, 54, 1)",
          "rgba(158, 158, 158, 1)"
        ],
        borderWidth: 1
      }
    ]
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Students"
        }
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
