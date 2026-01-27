import { useState } from 'react';
import { BarChart3, Loader2, AlertCircle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import type { GigScore } from '../types';

export function GigScoreChecker() {
    const [description, setDescription] = useState('');
    const [isScoring, setIsScoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState<GigScore | null>(null);

    const handleScore = async () => {
        if (!description.trim()) {
            setError('Please enter a gig description to analyze');
            return;
        }

        if (description.length < 100) {
            setError('Description is too short. Enter at least 100 characters.');
            return;
        }

        setIsScoring(true);
        setError(null);

        try {
            const result = await openaiService.scoreGigDescription(description);
            setScore(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Scoring failed');
        } finally {
            setIsScoring(false);
        }
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'grade-a';
            case 'B': return 'grade-b';
            case 'C': return 'grade-c';
            case 'D': return 'grade-d';
            case 'F': return 'grade-f';
            default: return '';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-medium';
        return 'score-low';
    };

    return (
        <div className="gig-score-checker">
            <div className="checker-header">
                <h3><BarChart3 size={20} /> Gig Score Checker</h3>
                <p>Analyze your gig description for SEO, readability, and conversion</p>
            </div>

            <div className="checker-input">
                <textarea
                    placeholder="Paste your existing gig description here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                />
                <div className="char-count">{description.length} characters</div>
            </div>

            <button
                onClick={handleScore}
                disabled={isScoring}
                className="btn btn-primary w-full"
            >
                {isScoring ? (
                    <>
                        <Loader2 className="animate-spin" size={16} />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <BarChart3 size={16} />
                        Score My Gig
                    </>
                )}
            </button>

            {error && (
                <div className="checker-error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {score && (
                <div className="score-results">
                    <div className="overall-score">
                        <div className={`grade-circle ${getGradeColor(score.grade)}`}>
                            {score.grade}
                        </div>
                        <div className="score-details">
                            <div className="overall-number">{score.overallScore}/100</div>
                            <div className="overall-label">Overall Score</div>
                        </div>
                    </div>

                    <div className="score-breakdown">
                        <div className="score-item">
                            <div className="score-label">SEO</div>
                            <div className="score-bar">
                                <div
                                    className={`score-fill ${getScoreColor(score.seoScore)}`}
                                    style={{ width: `${score.seoScore}%` }}
                                />
                            </div>
                            <div className="score-value">{score.seoScore}</div>
                        </div>
                        <div className="score-item">
                            <div className="score-label">Readability</div>
                            <div className="score-bar">
                                <div
                                    className={`score-fill ${getScoreColor(score.readabilityScore)}`}
                                    style={{ width: `${score.readabilityScore}%` }}
                                />
                            </div>
                            <div className="score-value">{score.readabilityScore}</div>
                        </div>
                        <div className="score-item">
                            <div className="score-label">Conversion</div>
                            <div className="score-bar">
                                <div
                                    className={`score-fill ${getScoreColor(score.conversionScore)}`}
                                    style={{ width: `${score.conversionScore}%` }}
                                />
                            </div>
                            <div className="score-value">{score.conversionScore}</div>
                        </div>
                    </div>

                    {score.seoIssues.length > 0 && (
                        <div className="issues-section">
                            <h5><XCircle size={14} /> SEO Issues</h5>
                            <ul>
                                {score.seoIssues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {score.readabilityIssues.length > 0 && (
                        <div className="issues-section">
                            <h5><XCircle size={14} /> Readability Issues</h5>
                            <ul>
                                {score.readabilityIssues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {score.conversionIssues.length > 0 && (
                        <div className="issues-section">
                            <h5><XCircle size={14} /> Conversion Issues</h5>
                            <ul>
                                {score.conversionIssues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="improvements-section">
                        <h5><Lightbulb size={14} /> Recommended Improvements</h5>
                        <ul>
                            {score.improvements.map((imp, i) => (
                                <li key={i}><CheckCircle size={12} /> {imp}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
