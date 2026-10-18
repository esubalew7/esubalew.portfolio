import { memo } from 'react';
import { PromptPrefix } from './TerminalPrompt';
import { extractItemName } from './terminalFormatter.js';

const ProcessingDots = () => (
  <span>
    Processing<span className="processing-dots">...</span>
  </span>
);

const renderSafeContent = (content) => {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string' || typeof content === 'number') return content;
  if (Array.isArray(content)) {
    return content.map((c) => (typeof c === 'object' ? extractItemName(c) : String(c))).join(', ');
  }
  if (typeof content === 'object') {
    return extractItemName(content) || '';
  }
  return String(content);
};

const TerminalLine = memo(({ line, promptPrefix }) => {
  const content = renderSafeContent(line?.content);

  if (line.type === 'welcome') {
    return (
      <div className="text-[#7dd3fc] whitespace-pre-wrap break-words mb-3 leading-[1.45] font-mono text-[13px]">
        {content}
      </div>
    );
  }

  if (line.type === 'command') {
    return (
      <div className="flex items-start font-mono text-[13px] leading-[1.45]">
        <PromptPrefix prefix={promptPrefix} />
        <span className="text-[#d4d4d4] break-all font-semibold">{content}</span>
      </div>
    );
  }

  if (line.type === 'error') {
    return (
      <div className="text-[#f48771] whitespace-pre-wrap break-words leading-[1.45] font-mono text-[13px] my-1">
        {content}
      </div>
    );
  }

  if (line.type === 'processing') {
    return (
      <div className="text-[#888] leading-[1.45] font-mono text-[13px] my-1">
        <ProcessingDots />
      </div>
    );
  }

  if (line.type === 'interrupt') {
    return (
      <div className="text-[#888] leading-[1.45] font-mono text-[13px]">
        {content}
      </div>
    );
  }

  if (line.type === 'abort') {
    return (
      <div className="text-[#f48771] leading-[1.45] font-mono text-[13px] my-1">
        {content}
      </div>
    );
  }

  return (
    <div className="text-[#c0c0c0] whitespace-pre-wrap break-words leading-[1.45] font-mono text-[13px] my-1">
      {content}
    </div>
  );
});

TerminalLine.displayName = 'TerminalLine';

export default TerminalLine;
