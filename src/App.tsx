import { useState, ChangeEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Copy, CheckCircle2, AlertCircle, Maximize2, Minus, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Utility for neat class merging
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    highlights: '',
    improvements: '',
    notes: '',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateReport = async () => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên học sinh.');
      return;
    }
    if (!formData.highlights.trim()) {
      setError('Vui lòng nhập điểm nổi bật.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult('');
    setCopied(false);

    const prompt = `
VAI TRÒ: 
Bạn là Cố Vấn Học Vụ chuyên trách viết Sổ Liên Lạc cho giáo viên chủ nhiệm bậc Tiểu học và THCS. Bạn am hiểu tâm lý phụ huynh Việt Nam, luôn đặt sự nỗ lực của học sinh lên trên điểm số.

RÀNG BUỘC (QUAN TRỌNG):
1. TUYỆT ĐỐI không sử dụng ngôn từ tiêu cực trực diện (như lười, dốt, yếu kém, kém tập trung).
2. Luôn mở đầu bằng một lời khen CỤ THỂ về sự nỗ lực.
3. Điểm cần cải thiện phải diễn đạt dưới dạng "cơ hội phát triển" hoặc "điều gia đình có thể cùng hỗ trợ".
4. Viết đúng 5 câu, tạo thành MỘT ĐOẠN VĂN DUY NHẤT (không xuống dòng).
5. Văn phong chân thành, chuyên nghiệp.

ĐỊNH DẠNG BẮT BUỘC (5 câu theo thứ tự sau):
- Câu 1: Lời chào thân tình gửi gia đình + tên học sinh (vd: Kính chào gia đình, tuần qua em [Tên] đã...).
- Câu 2: Ghi nhận ưu điểm cụ thể từ phần 'Điểm nổi bật'.
- Câu 3: Ghi nhận ưu điểm thứ hai hoặc nhắc nhở về sự tiến bộ chung.
- Câu 4: Gợi ý cải thiện nhẹ nhàng từ phần 'Điều cần cải thiện' (nên dùng cụm "Gia đình cùng em..." hoặc "Ở nhà, ba mẹ có thể...").
- Câu 5: Lời động viên và định hướng tuần tới.

THÔNG TIN HỌC SINH TỪ GIÁO VIÊN:
- Tên học sinh: ${formData.name}
- Điểm nổi bật: ${formData.highlights}
- Điều cần cải thiện: ${formData.improvements || 'Không có'}
- Ghi chú thêm: ${formData.notes || 'Không có'}

Chỉ trả về 1 đoạn văn 5 câu duy nhất. KHÔNG thêm bất kỳ bình luận nào khác.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      
      if (response.text) {
        setResult(response.text.trim());
      } else {
        setError('Không thể tạo nhận xét lúc này. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi kết nối tới mô hình AI. Vui lòng kiểm tra API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="min-h-screen macos-bg flex items-center justify-center p-4 sm:p-8 font-sans antialiased text-[#1d1d1f] selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Decorative background orbs for Tahoe aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      {/* Main Glass Window */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-window rounded-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative z-10"
      >
        {/* MacOS Window Controls (Decorative) */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 border border-red-600/50 flex items-center justify-center group hover:bg-red-500 cursor-pointer">
             <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-red-900 transition-opacity" />
          </div>
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 border border-yellow-600/50 flex items-center justify-center group hover:bg-yellow-500 cursor-pointer">
            <Minus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-yellow-900 transition-opacity" />
          </div>
          <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 border border-green-600/50 flex items-center justify-center group hover:bg-green-500 cursor-pointer">
            <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 text-green-900 transition-opacity" />
          </div>
        </div>

        {/* Input Section */}
        <div className="w-full md:w-1/2 p-8 pt-12 md:p-12 border-b md:border-b-0 md:border-r border-white/40 bg-white/10 relative z-10">
          <div className="mb-8">
             <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-1 pl-1">Soạn Nhận Xét Tuần</h1>
             <p className="text-sm text-gray-600 pl-1">Nhập thông tin học sinh để tạo nội dung.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 pl-1 uppercase tracking-widest">Tên học sinh *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3 rounded-xl text-[15px]"
                placeholder="VD: Trần Văn A"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 pl-1 uppercase tracking-widest">Điểm nổi bật tuần qua *</label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3 rounded-xl text-[15px] min-h-[80px] resize-none"
                placeholder="VD: Xung phong phát biểu, giúp đỡ bạn bè..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 pl-1 uppercase tracking-widest">Điều cần cải thiện (Tùy chọn)</label>
              <textarea
                name="improvements"
                value={formData.improvements}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3 rounded-xl text-[15px] min-h-[60px] resize-none"
                placeholder="VD: Còn nói chuyện riêng, chữ viết chưa cẩn thận..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 pl-1 uppercase tracking-widest">Ghi chú thêm (Tùy chọn)</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3 rounded-xl text-[15px]"
                placeholder="VD: Nhắc phụ huynh chuẩn bị vở mới..."
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className={cn(
                "w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all text-[15px]",
                isGenerating 
                  ? "bg-white/50 text-gray-400 cursor-not-allowed" 
                  : "btn-primary active:scale-[0.98]"
               )}
            >
              {isGenerating ? (
                <>
                   <RefreshCw className="w-4 h-4 animate-spin" />
                   Đang sinh nhận xét...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tạo Nhận Xét Sổ Liên Lạc
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="w-full md:w-1/2 p-8 pt-10 md:p-12 flex flex-col justify-center relative z-10 bg-white/20">
           
           {error && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
             >
               <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
               <p className="text-sm text-red-800">{error}</p>
             </motion.div>
           )}

           <div className="flex-1 flex flex-col justify-center">
             <AnimatePresence mode="wait">
               {!result && !isGenerating && !error && (
                 <motion.div 
                   key="empty"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0, transition: { duration: 0.2 } }}
                   className="text-center flex flex-col items-center gap-4 text-gray-500"
                 >
                   <div className="w-16 h-16 rounded-full bg-white/40 border border-white/50 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 opacity-40 text-gray-500" />
                   </div>
                   <p className="text-sm max-w-[250px] leading-relaxed">
                      Nội dung Sổ liên lạc sẽ xuất hiện tại đây sau khi bạn điền thông tin và bấm "Tạo".
                   </p>
                 </motion.div>
               )}

               {isGenerating && (
                 <motion.div
                   key="loading"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0, transition: { duration: 0.2 } }}
                   className="flex flex-col items-center justify-center gap-4 text-gray-500"
                 >
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500/50" />
                    <p className="text-sm animate-pulse">Trí tuệ nhân tạo đang cân nhắc câu từ...</p>
                 </motion.div>
               )}

               {result && !isGenerating && (
                 <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-col h-full"
                 >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-semibold text-gray-600 tracking-widest uppercase">Bản thảo gửi Phụ huynh</h3>
                      <button
                        onClick={copyToClipboard}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all",
                          copied 
                            ? "bg-green-100 text-green-700 border border-green-200" 
                            : "bg-white/50 hover:bg-white/80 text-gray-700 border border-white/60"
                        )}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Sao chép
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="glass-panel flex-1 p-7 rounded-[20px] min-h-[250px] relative overflow-hidden group">
                       <p className="text-[14px] italic leading-[1.6] text-[#555] relative z-10 selection:bg-blue-500/20">
                         {result}
                       </p>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
