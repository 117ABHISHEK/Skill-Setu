import React from 'react';

interface AIFeedbackProps {
  engagementScore: number;
  teachingScore: number;
  participationScore: number;
  lectureQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  keyStrengths?: string[];
  improvementAreas?: string[];
  notes?: string;
  recommendations?: string[];
}

const AIFeedback: React.FC<AIFeedbackProps> = ({
  engagementScore,
  teachingScore,
  participationScore,
  lectureQuality,
  keyStrengths = [],
  improvementAreas = [],
  notes,
  recommendations = [],
}) => {
  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Session Analysis</h3>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Engagement</div>
          <div className={`text-3xl font-bold ${getScoreColor(engagementScore)}`}>
            {engagementScore}%
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Teaching</div>
          <div className={`text-3xl font-bold ${getScoreColor(teachingScore)}`}>
            {teachingScore}%
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Participation</div>
          <div className={`text-3xl font-bold ${getScoreColor(participationScore)}`}>
            {participationScore}%
          </div>
        </div>
      </div>

      {/* Lecture Quality */}
      {lectureQuality && (
        <div className={`p-4 rounded-lg border-2 ${getQualityColor(lectureQuality)}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Lecture Quality:</span>
            <span className="text-lg font-bold capitalize">{lectureQuality}</span>
          </div>
        </div>
      )}

      {/* Key Strengths */}
      {keyStrengths.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">✨ Key Strengths</h4>
          <ul className="list-disc list-inside space-y-1 text-green-800">
            {keyStrengths.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Areas */}
      {improvementAreas.length > 0 && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-2">📈 Areas for Improvement</h4>
          <ul className="list-disc list-inside space-y-1 text-yellow-800">
            {improvementAreas.map((area, idx) => (
              <li key={idx}>{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📝 Analysis Notes</h4>
          <p className="text-blue-800 whitespace-pre-line">{notes}</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">💡 Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-purple-800">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIFeedback;
