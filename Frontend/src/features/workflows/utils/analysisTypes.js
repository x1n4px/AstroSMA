export const analysisTypes = {
    "Trajectory Analysis": [
        {
            key: "basicAcceleration",
            label: "Average Acceleration (Static)",
            description: "Display average acceleration measurement for the meteor",
            xQuery: "meteorAcceleration",
            yQuery: "meteorAcceleration",
            xQueryGeneral: "acceleration",
            yQueryGeneral: "acceleration",
            xLabel: "Index",
            yLabel: "Acceleration (km/s²)",
            chartType: "column"
        },
        {
            key: "velocityTime",
            label: "Velocity vs Time",
            description: "Track velocity changes over time during meteor event",
            xQuery: "meteorTrajectoryTime",
            yQuery: "meteorTrajectoryTime",
            xQueryGeneral: "trajectoryTime",
            yQueryGeneral: "trajectoryTime",
            xLabel: "Time (s)",
            yLabel: "Velocity (km/s)",
            chartType: "line",
            isXYPair: true
        },
        {
            key: "accelerationTime",
            label: "Acceleration vs Time",
            description: "Track acceleration changes over time during meteor event",
            xQuery: "meteorAccelerationTime",
            yQuery: "meteorAccelerationTime",
            xQueryGeneral: "accelerationTime",
            yQueryGeneral: "accelerationTime",
            xLabel: "Time (s)",
            yLabel: "Acceleration (km/s²)",
            chartType: "line",
            isXYPair: true
        },
        {
            key: "basicVelocity",
            label: "Average Velocity (Static)",
            description: "Display average velocity measurement for the meteor",
            xQuery: "meteorVelocity",
            yQuery: "meteorVelocity",
            xQueryGeneral: "avgSpeed",
            yQueryGeneral: "avgSpeed",
            xLabel: "Index",
            yLabel: "Velocity (km/s)",
            chartType: "column"
        },
        {
            key: "distanceTime",
            label: "Distance vs Time",
            description: "Track distance traveled over time",
            xQuery: "meteorTrajectoryDistance",
            yQuery: "meteorTrajectoryDistance",
            xQueryGeneral: "trajectoryDistance",
            yQueryGeneral: "trajectoryDistance",
            xLabel: "Time (s)",
            yLabel: "Distance (km)",
            chartType: "line",
            isXYPair: true
        },
        {
            key: "distanceVelocity",
            label: "Distance vs Velocity",
            description: "Compare distance traveled with velocity",
            xQuery: "meteorDistanceVsVelocity",
            yQuery: "meteorDistanceVsVelocity",
            xQueryGeneral: "distanceVsVelocity",
            yQueryGeneral: "distanceVsVelocity",
            xLabel: "Distance (km)",
            yLabel: "Velocity (km/s)",
            chartType: "scatter",
            isXYPair: true
        }
    ],
    "Photometric Analysis": [
        {
            key: "lightCurve",
            label: "Light Curve (Magnitude vs Time)",
            description: "Track brightness changes over time",
            xQuery: "meteorLightCurve",
            yQuery: "meteorLightCurve",
            xQueryGeneral: "lightCurve",
            yQueryGeneral: "lightCurve",
            xLabel: "Time (s)",
            yLabel: "Magnitude",
            chartType: "line",
            isXYPair: true
        },
        {
            key: "magnitudeDistance",
            label: "Magnitude vs Distance",
            description: "Brightness variation with distance",
            xQuery: "meteorMagnitudeDistance",
            yQuery: "meteorMagnitudeDistance",
            xQueryGeneral: "magnitudeDistance",
            yQueryGeneral: "magnitudeDistance",
            xLabel: "Distance (km)",
            yLabel: "Magnitude",
            chartType: "scatter",
            isXYPair: true
        },
        {
            key: "magnitudeMass",
            label: "Magnitude vs Photometric Mass",
            description: "Relationship between brightness and estimated mass",
            xQuery: "meteorPhotometricMass",
            yQuery: "meteorPhotometricMass",
            xQueryGeneral: "photometricMass",
            yQueryGeneral: "photometricMass",
            xLabel: "Maximum Magnitude",
            yLabel: "Photometric Mass (g)",
            chartType: "scatter",
            isXYPair: true
        }
    ],
    "Error Analysis": [
        {
            key: "velocityError",
            label: "Velocity vs Measurement Error",
            description: "Assess velocity measurement accuracy",
            xQuery: "meteorVelocityError",
            yQuery: "meteorVelocityError",
            xQueryGeneral: "velocityError",
            yQueryGeneral: "velocityError",
            xLabel: "Velocity (km/s)",
            yLabel: "Error (km/s)",
            chartType: "scatter",
            isXYPair: true
        },
        {
            key: "distanceError",
            label: "Distance vs Measurement Error",
            description: "Assess distance measurement accuracy",
            xQuery: "meteorDistanceError",
            yQuery: "meteorDistanceError",
            xQueryGeneral: "distanceError",
            yQueryGeneral: "distanceError",
            xLabel: "Distance (km)",
            yLabel: "Error (km)",
            chartType: "scatter",
            isXYPair: true
        },
        {
            key: "photometricError",
            label: "Magnitude vs Photometric Error",
            description: "Assess photometric measurement accuracy",
            xQuery: "meteorPhotometricError",
            yQuery: "meteorPhotometricError",
            xQueryGeneral: "photometricError",
            yQueryGeneral: "photometricError",
            xLabel: "Magnitude",
            yLabel: "Regression Error",
            chartType: "scatter",
            isXYPair: true
        }
    ],
    "Temporal Patterns": [
        {
            key: "dailyPattern",
            label: "Meteors by Hour of Day",
            description: "Daily distribution of meteor observations",
            xQuery: "dailyPattern",
            yQuery: "dailyPattern",
            xQueryGeneral: "dailyPattern",
            yQueryGeneral: "dailyPattern",
            xLabel: "Hour of Day",
            yLabel: "Number of Meteors",
            chartType: "area",
            isXYPair: true,
            generalOnly: true
        },
        {
            key: "monthlyPattern",
            label: "Meteors by Month", 
            description: "Monthly distribution of meteor observations",
            xQuery: "monthlyPattern",
            yQuery: "monthlyPattern",
            xQueryGeneral: "monthlyPattern",
            yQueryGeneral: "monthlyPattern",
            xLabel: "Month",
            yLabel: "Number of Meteors",
            chartType: "area",
            isXYPair: true,
            generalOnly: true
        }
    ],
    "Observatory Analysis": [
        {
            key: "observatoryVelocity",
            label: "Observatory vs Average Velocity",
            description: "Compare velocity measurements across observatories",
            xQuery: "observatoryVelocity",
            yQuery: "observatoryVelocity",
            xQueryGeneral: "observatoryVelocity",
            yQueryGeneral: "observatoryVelocity",
            xLabel: "Observatory",
            yLabel: "Average Velocity (km/s)",
            chartType: "bar",
            isXYPair: true,
            generalOnly: true
        },
        {
            key: "observatoryCount",
            label: "Observatory vs Meteor Count",
            description: "Number of meteors observed by each observatory",
            xQuery: "observatoryCount",
            yQuery: "observatoryCount",
            xQueryGeneral: "observatoryCount",
            yQueryGeneral: "observatoryCount",
            xLabel: "Observatory",
            yLabel: "Meteor Count",
            chartType: "bar",
            isXYPair: true,
            generalOnly: true
        }
    ]
};
