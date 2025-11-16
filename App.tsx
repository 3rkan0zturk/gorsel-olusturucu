import React, { useState, useCallback, useEffect } from 'react';
import type { AspectRatioOption } from './types';
import { generateImages, generateRandomPrompt } from './services/geminiService';
import Header from './components/Header';
import AspectRatioSelector from './components/AspectRatioSelector';
import InputBar from './components/InputBar';
import ImageGrid from './components/ImageGrid';
import Spinner from './components/Spinner';
import { ASPECT_RATIOS } from './constants';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(ASPECT_RATIOS[1]);
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    // Check for SpeechRecognition API
    // FIX: Cast window to any to access browser-specific SpeechRecognition APIs.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API bu tarayıcıda desteklenmiyor.');
    }
  }, []);

  const handleGenerateImages = useCallback(async (currentPrompt: string) => {
    if (!currentPrompt) {
      setError('Lütfen bir metin girin.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImages([]);

    try {
      const generatedImages = await generateImages(currentPrompt, aspectRatio.value);
      setImages(generatedImages);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Görsel oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }, [aspectRatio]);

  const handleRandomGeneration = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setImages([]);
    setPrompt('Rastgele bir fikir üretiliyor...');
    try {
      const randomPrompt = await generateRandomPrompt();
      setPrompt(randomPrompt);
      await handleGenerateImages(randomPrompt);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Rastgele metin üretilirken bir hata oluştu.');
      setPrompt('');
    } finally {
      setIsLoading(false);
    }
  }, [handleGenerateImages]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        <Header />

        <main className="flex-grow flex flex-col items-center justify-center space-y-8 py-8">
          <AspectRatioSelector
            options={ASPECT_RATIOS}
            selected={aspectRatio}
            onSelect={setAspectRatio}
          />
          
          {isLoading && <Spinner />}

          {error && <p className="text-red-400 bg-red-900/50 px-4 py-2 rounded-md">{error}</p>}
          
          <ImageGrid images={images} isLoading={isLoading} />
        </main>
        
        <footer className="sticky bottom-0 left-0 right-0 w-full p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50">
           <div className="w-full max-w-2xl mx-auto">
            <InputBar
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={() => handleGenerateImages(prompt)}
              onRandom={handleRandomGeneration}
              isGenerating={isLoading}
              isListening={isListening}
              setIsListening={setIsListening}
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
