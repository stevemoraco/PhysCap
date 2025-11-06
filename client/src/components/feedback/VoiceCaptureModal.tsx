import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, Square, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';

interface VoiceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface TranscriptionResult {
  transcript: string;
  expertise: string[];
}

export function VoiceCaptureModal({ isOpen, onClose, projectId }: VoiceCaptureModalProps) {
  const { toast } = useToast();
  const {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    error: recordingError,
    startRecording,
    stopRecording,
    reset: resetRecording,
  } = useVoiceCapture();
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      const formData = new FormData();
      formData.append('audio', blob, 'voice-feedback.webm');
      formData.append('projectId', projectId);

      const response = await fetch('/api/feedback/voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload voice feedback');
      }

      return response.json();
    },
    onSuccess: (data: TranscriptionResult) => {
      setTranscription(data);
      toast({
        title: 'Feedback Recorded!',
        description: 'Your voice feedback has been transcribed and saved.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const submitFeedback = () => {
    if (audioBlob) {
      uploadMutation.mutate(audioBlob);
    }
  };

  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setTranscription(null);
    resetRecording();
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    handleReset();
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Share Your Expertise
          </DialogTitle>
          <DialogDescription>
            Record your thoughts and insights about {projectId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recording UI */}
          {!transcription && (
            <>
              {recordingError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {recordingError}
                </div>
              )}
              {/* Waveform visualization */}
              <div className="flex items-center justify-center h-32 bg-accent/10 rounded-lg border-2 border-dashed border-accent/30">
                <div className="text-center">
                  {isRecording ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-primary rounded-full animate-pulse"
                            style={{
                              height: `${20 + Math.random() * 40}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-primary">
                        Recording... {formatTime(duration)}
                      </p>
                    </div>
                  ) : audioBlob ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                      <p className="text-sm font-medium">
                        Recording captured ({formatTime(duration)})
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Mic className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click below to start recording
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio playback */}
              {audioUrl && !uploadMutation.isPending && (
                <div className="flex justify-center">
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3">
                {!audioBlob ? (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? 'destructive' : 'default'}
                    className="flex-1"
                    disabled={uploadMutation.isPending}
                  >
                    {isRecording ? (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleReset} variant="outline" className="flex-1">
                      Re-record
                    </Button>
                    <Button
                      onClick={submitFeedback}
                      disabled={!audioBlob || uploadMutation.isPending}
                      className="flex-1"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Transcription result */}
          {transcription && (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent/10 p-4 border border-accent/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Transcription
                </h4>
                <p className="text-sm text-foreground/80">
                  {transcription.transcript}
                </p>
              </div>

              {transcription.expertise.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">
                    Detected Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {transcription.expertise.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
