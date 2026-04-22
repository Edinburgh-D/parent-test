export default function Home({ onStart }) {
  return (
    <div className="page home">
      <div className="card center">
        <h1>父母成长等级测试</h1>
        <p className="subtitle">10道题，测出你的育儿风格与成长方向</p>
        <div className="features">
          <span>✅ 科学测评</span>
          <span>✅ 即时报告</span>
          <span>✅ 课程推荐</span>
        </div>
        <button className="btn-primary" onClick={onStart}>开始测试</button>
      </div>
    </div>
  );
}
