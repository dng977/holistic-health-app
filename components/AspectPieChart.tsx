import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { VictoryPie, VictoryLabel, VictoryContainer, VictoryTooltip } from 'victory-native';

type AspectData = {
  name: string;
  value: number;
  color: string;
  completionPercentage: number; // 0-100
  description?: string; // Description for the popup
};

type AspectPieChartProps = {
  data: AspectData[];
  size?: 'small' | 'medium' | 'large';
  onSlicePress?: (index: number) => void;
};

export function AspectPieChart({ 
  data, 
  size = 'large',
  onSlicePress
}: AspectPieChartProps) {
  // Track which slice is being hovered
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Track which slice is selected for the popup
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Modal visibility state
  const [modalVisible, setModalVisible] = useState(false);
  // Calculate chart size based on prop
  const chartSize = size === 'small' ? 200 : size === 'medium' ? 250 : 300;
  
  // Prepare data for the Victory pie chart
  const pieData = data.map((item) => ({
    x: item.name,
    y: item.value,
    color: item.color,
    completionPercentage: item.completionPercentage,
    // No label for the outline
    label: "",
    // Calculate the radius based on completion percentage
    radius: 1 // Full radius for the pie slice outline
  }));
  
  // Create a second dataset for the filled portions
  const filledPieData = data.map((item) => ({
    x: item.name,
    y: item.value,
    color: item.color,
    completionPercentage: item.completionPercentage,
    // Add combined name and percentage label to the filled portion
    label: `${item.name}\n${item.completionPercentage}%`,
    // Scale the radius based on completion percentage
    radius: (item.completionPercentage / 100)
  }));

  // Handle slice press
  const handleSlicePress = (event: any, data: any) => {
    const index = pieData.findIndex(item => item.x === data.datum.x);
    if (index !== -1) {
      if (onSlicePress) {
        // If onSlicePress is provided, use that instead of showing modal
        onSlicePress(index);
      } else {
        // Default behavior: show modal with details
        setSelectedIndex(index);
        setModalVisible(true);
      }
    }
  };
  
  // Handle slice hover
  const handleSliceHover = (event: any, data: any) => {
    const index = pieData.findIndex(item => item.x === data.datum.x);
    if (index !== -1) {
      setHoveredIndex(index);
    }
  };
  
  // Handle slice hover exit
  const handleSliceHoverExit = () => {
    setHoveredIndex(null);
  };

  return (
    <View className="items-center my-4">
      {/* Description Popup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <Pressable 
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-lg p-5 m-5 w-4/5 shadow-lg">
            {selectedIndex !== null && (
              <>
                <View className="flex-row items-center mb-3">
                  <View 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: data[selectedIndex].color }} 
                  />
                  <Text className="text-xl font-bold text-[#212121]">{data[selectedIndex].name}</Text>
                </View>
                <Text className="text-base text-[#424242] mb-3">
                  {data[selectedIndex].description || 'No description available.'}
                </Text>
                <Text className="text-base font-semibold text-[#212121] mb-1">
                  Completion: {data[selectedIndex].completionPercentage}%
                </Text>
                <View className="h-2 bg-gray-200 rounded-full w-full overflow-hidden mt-1 mb-4">
                  <View 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${data[selectedIndex].completionPercentage}%`,
                      backgroundColor: data[selectedIndex].color 
                    }} 
                  />
                </View>
                <Pressable
                  className="bg-[#2196F3] py-2 px-4 rounded-lg self-end"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-medium">Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
      
      <View className="mb-4" style={{ width: chartSize, height: chartSize, position: 'relative' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Filled pie chart based on completion percentage (bottom layer) */}
          <VictoryPie
            width={chartSize}
            height={chartSize}
            data={filledPieData}
            innerRadius={0}
            padAngle={1}
            // animate={{ duration: 100 }}
            style={{
              data: {
                fill: ({ datum, index }) => {
                  return datum.color;
                },
                fillOpacity: ({ index }) => {
                  // Increase opacity for hovered slice
                  return hoveredIndex === index ? 0.9 : 0.7;
                },
                // Note: CSS filter property is not supported in React Native
                // Removed filter property to fix warnings
              },
              labels: {
                fill: '#000000',
                fontSize: size === 'small' ? 10 : 12,
                fontWeight: 'bold',
                lineHeight: 1.2,
              }
            }}
            radius={({ datum }) => (chartSize / 2) * datum.radius}
            labelComponent={
              <VictoryLabel 
                textAnchor="middle"
                verticalAnchor="middle"
                style={[
                  { fontSize: size === 'small' ? 12 : 14, fill: '#212121' },
                  { fontSize: size === 'small' ? 10 : 12,fill: '#000000' }
                ]}
                lineHeight={1.3}
                dy={5}
              />
            }
            standalone={true}
          />
        </View>
        
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Background pie chart (outlines and labels - top layer) */}
          <VictoryPie
            width={chartSize}
            height={chartSize}
            data={pieData}
            innerRadius={0}
            padAngle={1}
            animate={{ duration: 100 }}
            events={[{
              target: "data",
              eventHandlers: {
                onPress: handleSlicePress,
                onMouseOver: handleSliceHover,
                onMouseOut: handleSliceHoverExit,
                // For touch devices
                onTouchStart: handleSliceHover,
                onTouchEnd: handleSliceHoverExit
              }
            }]}
            style={{
              data: {
                fill: 'transparent',
                stroke: ({ datum }) => datum.color,
                strokeWidth: 0, // Remove the stroke
              },
              labels: {
                fill: 'transparent', // Hide labels on the outline
              }
            }}
            radius={({ datum }) => (chartSize / 2) * datum.radius}
            labelRadius={({ datum }) => chartSize * 0.4 + 15}
            containerComponent={<VictoryContainer responsive={false} />}
            labelComponent={
              <VictoryLabel 
                textAnchor="middle"
                verticalAnchor="middle"
                style={{ fill: 'transparent' }}
              />
            }
            standalone={true}
          />
        </View>
      </View>
    </View>
  );
}


