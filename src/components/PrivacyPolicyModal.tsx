import React from 'react';
import { X, ShieldCheck, Lock, Eye, Cookie, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'zh' | 'en';
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-pink-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh' ? '隐私政策与条款 (Privacy Policy)' : 'Privacy Policy & Terms'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {language === 'zh' ? (
            <>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2 font-mono">
                  最后更新日期：2026 年 10 月 30 日
                </p>
                <p>
                  欢迎使用 <strong>Speak on the Beat (funcenter.app)</strong>（以下简称“本网站”）。我们高度重视您的隐私权，并致力于保护您的个人信息安全。本隐私政策旨在向您说明我们如何收集、使用以及披露信息。
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                  <Eye className="w-4 h-4 text-pink-500" /> 1. 信息收集与使用
                </h3>
                <p>
                  本网站为纯客户端运行的卡点节奏趣味工具，不会强制要求用户注册或提交真实姓名、身份证件或手机号等敏感个人身份信息。
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong>本地存储 (LocalStorage)：</strong> 您的自定义关卡配置、游戏历史记录与语言设置仅保存在您的浏览器本地，不会上传至第三方服务器。</li>
                  <li><strong>麦克风权限：</strong> 仅当您主动开启“麦克风发声识别”功能时，浏览器会临时处理音频输入以检测声音卡点，所有声音检测均在本地浏览器通过 Web Audio API 即时运算完成，<strong>绝不会录音、存储或上传任何音频</strong>。</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                  <Cookie className="w-4 h-4 text-pink-500" /> 2. Google AdSense 与第三方广告说明
                </h3>
                <p>
                  本网站使用第三方供应商（包括 <strong>Google AdSense</strong>）来投放广告，以支持网站的免费运营与服务器开销：
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li>第三方供应商（包括 Google）会使用 Cookie 根据用户此前访问本网站或其他网站的记录来投放广告。</li>
                  <li>Google 使用广告 Cookie，使得 Google 及其合作伙伴能够根据用户对本网站和/或互联网上其他网站的访问记录向用户投放广告。</li>
                  <li>
                    您可以访问 <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 underline font-medium inline-flex items-center gap-0.5">Google 广告设置 <ExternalLink className="w-3 h-3" /></a> 选择停用个性化广告。
                  </li>
                  <li>
                    您也可以访问 <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 underline font-medium inline-flex items-center gap-0.5">aboutads.info <ExternalLink className="w-3 h-3" /></a>，停用某些第三方供应商用于投放个性化广告的 Cookie。
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                  <Lock className="w-4 h-4 text-pink-500" /> 3. 数据安全与第三方链接
                </h3>
                <p>
                  本网站通过 HTTPS 安全加密传输。本网站可能包含指向第三方网站的外部链接，我们对第三方网站的隐私条例或内容不承担法律责任，建议您查阅相应网站的独立隐私条款。
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  4. 联系我们
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  如果您对本隐私政策有任何疑问，请通过电子邮件与我们联系：<span className="font-mono text-pink-600 dark:text-pink-400">support@funcenter.app</span>。
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2 font-mono">
                  Last Updated: October 30, 2026
                </p>
                <p>
                  Welcome to <strong>Speak on the Beat (funcenter.app)</strong>. We respect your privacy and are committed to protecting any personal data processed through our website.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                  <Eye className="w-4 h-4 text-pink-500" /> 1. Information Collection and Usage
                </h3>
                <p>
                  Speak on the Beat runs primarily in your browser. We do not require account registration or store sensitive personal identifiers.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong>Local Storage:</strong> Custom levels, language, and game scores are stored locally on your device in your browser's local storage.</li>
                  <li><strong>Microphone Permission:</strong> When you enable acoustic hit detection, audio input is processed in real time via the Web Audio API entirely inside your browser. <strong>Audio is never recorded, stored, or transmitted to any remote servers.</strong></li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                  <Cookie className="w-4 h-4 text-pink-500" /> 2. Google AdSense & Third-Party Cookies
                </h3>
                <p>
                  We partner with third-party vendors, including <strong>Google AdSense</strong>, to display ads when you visit our website:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
                  <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.</li>
                  <li>
                    Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 underline font-medium inline-flex items-center gap-0.5">Google Ads Settings <ExternalLink className="w-3 h-3" /></a>.
                  </li>
                  <li>
                    Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 underline font-medium inline-flex items-center gap-0.5">aboutads.info <ExternalLink className="w-3 h-3" /></a>.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                  <Lock className="w-4 h-4 text-pink-500" /> 3. Data Protection
                </h3>
                <p>
                  All interactions with funcenter.app are encrypted using modern HTTPS protocols.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  4. Contact Us
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  If you have questions about this Privacy Policy, please contact us at: <span className="font-mono text-pink-600 dark:text-pink-400">support@funcenter.app</span>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            {language === 'zh' ? '了解并关闭' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
