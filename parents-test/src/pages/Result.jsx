import results from '../data/results.json';

export default function Result({ answers, onRestart, onGoCourses }) {
  const counts = answers.reduce((acc, cur) => {
    acc[cur] = (acc[cur] || 0) + 1;
    return acc;
  }, {});

  const type = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const data = results[type];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '父母成长等级测试',
        text: `我的测试结果：${data.title} — ${data.subtitle}`,
        url: window.location.href,
      });
    } else {
      alert('已复制结果，快去分享给朋友吧！');
    }
  };

  return (
    <div className="page result">
      <div className="card center">
        <div className="badge">测试结果</div>
        <h1>{data.title}</h1>
        <div className="subtitle">{data.subtitle}</div>
        <p className="desc">{data.description}</p>
        <div className="tip-box">
          <strong>💡 成长建议</strong>
          <p>{data.suggestion}</p>
        </div>
        <div className="course-box">
          <strong>📚 {data.course}</strong>
        </div>
        <div className="actions">
          <button className="btn-primary" onClick={onGoCourses}>查看课程</button>
          <button className="btn-secondary" onClick={handleShare}>分享结果</button>
          <button className="btn-ghost" onClick={onRestart}>再测一次</button>
        </div>
      </div>
    </div>
  );
}
