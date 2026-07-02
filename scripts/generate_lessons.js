/* RF Academy Pro deterministic curriculum generator.
 * Run with: node scripts/generate_lessons.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const LESSON_DIR = path.join(ROOT, 'data', 'lessons');
const VOCAB_DIR = path.join(ROOT, 'data', 'vocabulary');

const topic = (name, zh, category, terms, zhTerms) => ({
  name, zh, category,
  terms: terms.split('|').map((english, index) => ({ english, zh_tw: zhTerms.split('|')[index] }))
});

const TOPICS = [
  topic('RF Basic', '射頻基礎', 'rf',
    'radio frequency|electromagnetic wave|wavelength|frequency band|signal amplitude|signal phase|characteristic impedance|impedance matching|decibel ratio|noise floor',
    '射頻|電磁波|波長|頻帶|訊號振幅|訊號相位|特性阻抗|阻抗匹配|分貝比值|底噪'),
  topic('RF Measurement', '射頻量測', 'rf',
    'vector network analyzer|spectrum analyzer|signal generator|power meter|directional coupler|calibration plane|reference level|resolution bandwidth|video bandwidth|measurement uncertainty',
    '向量網路分析儀|頻譜分析儀|訊號產生器|功率計|方向耦合器|校正平面|參考位準|解析頻寬|視訊頻寬|量測不確定度'),
  topic('Antenna', '天線工程', 'rf',
    'antenna gain|radiation pattern|polarization mismatch|return loss|voltage standing wave ratio|antenna efficiency|beamwidth|front-to-back ratio|isotropic radiator|antenna connector',
    '天線增益|輻射場型|極化失配|回波損耗|電壓駐波比|天線效率|波束寬度|前後比|等向性輻射體|天線連接器'),
  topic('Conducted Power', '傳導功率', 'rf',
    'conducted output power|average power|peak power|power tolerance|cable loss|attenuator pad|power sensor|transmit chain|output backoff|maximum power setting',
    '傳導輸出功率|平均功率|峰值功率|功率容差|纜線損耗|衰減器|功率感測器|發射鏈路|輸出回退|最大功率設定'),
  topic('Radiated Power', '輻射功率', 'rf',
    'effective isotropic radiated power|effective radiated power|radiated spurious emission|turntable azimuth|antenna mast height|site attenuation|chamber validation|measurement distance|far-field condition|substitution method',
    '等效全向輻射功率|有效輻射功率|輻射雜散發射|轉台方位角|天線桿高度|場地衰減|暗室驗證|量測距離|遠場條件|替代法'),
  topic('Wi-Fi', 'Wi-Fi 測試', 'rf',
    'channel bandwidth|modulation coding scheme|occupied bandwidth|spectral mask|error vector magnitude|carrier frequency offset|dynamic frequency selection|transmit power control|guard interval|aggregate frame',
    '通道頻寬|調變編碼方案|佔用頻寬|頻譜遮罩|誤差向量幅度|載波頻率偏移|動態頻率選擇|發射功率控制|保護間隔|聚合訊框'),
  topic('Bluetooth', '藍牙測試', 'rf',
    'frequency hopping|advertising channel|data channel|access address|packet error rate|adaptive frequency hopping|basic rate|enhanced data rate|low energy mode|receiver sensitivity',
    '跳頻|廣播通道|資料通道|存取位址|封包錯誤率|適應性跳頻|基本速率|增強資料速率|低功耗模式|接收靈敏度'),
  topic('Cellular', '行動通訊測試', 'rf',
    'resource block|uplink power control|downlink channel|adjacent channel leakage ratio|spectrum emission mask|reference signal received power|total radiated power|total isotropic sensitivity|carrier aggregation|network signaling',
    '資源區塊|上行功率控制|下行通道|鄰頻洩漏比|頻譜發射遮罩|參考訊號接收功率|總輻射功率|總等向靈敏度|載波聚合|網路訊令'),
  topic('OTA', '空中介面測試', 'rf',
    'over-the-air test|quiet zone|probe antenna|positioner alignment|three-dimensional pattern|passive antenna test|active antenna test|phantom fixture|link budget|chamber correlation',
    '空中介面測試|靜區|探棒天線|定位器對準|三維場型|被動天線測試|主動天線測試|人體模型治具|鏈路預算|暗室相關性'),
  topic('EMC Basic', '電磁相容基礎', 'emc',
    'electromagnetic compatibility|emission limit|immunity level|equipment under test|auxiliary equipment|test configuration|ground reference plane|coupling path|common-mode current|differential-mode current',
    '電磁相容|發射限值|耐受度等級|受測設備|輔助設備|測試配置|接地參考平面|耦合路徑|共模電流|差模電流'),
  topic('Radiated Emission', '輻射發射', 'emc',
    'broadband disturbance|narrowband disturbance|quasi-peak detector|antenna polarization|maximum emission|ambient noise|pre-scan|final measurement|cable arrangement|compliance margin',
    '寬頻干擾|窄頻干擾|準峰值偵測器|天線極化|最大發射|環境雜訊|預掃描|最終量測|纜線配置|符合性裕度'),
  topic('Conducted Emission', '傳導發射', 'emc',
    'line impedance stabilization network|artificial mains network|mains terminal disturbance|average detector|measurement receiver|transient limiter|protective earth conductor|power lead arrangement|common-mode choke|conducted noise voltage',
    '線路阻抗穩定網路|人工電源網路|電源端干擾|平均值偵測器|量測接收機|暫態限制器|保護接地導體|電源線配置|共模扼流圈|傳導雜訊電壓'),
  topic('Immunity', '電磁耐受度', 'emc',
    'performance criterion|continuous disturbance|transient disturbance|degradation of performance|functional recovery|test severity level|dwell time|frequency sweep|modulation depth|field uniformity',
    '性能判據|連續干擾|暫態干擾|性能劣化|功能恢復|測試嚴酷度|駐留時間|頻率掃描|調變深度|場均勻性'),
  topic('ESD', '靜電放電', 'emc',
    'electrostatic discharge|contact discharge|air discharge|indirect discharge|horizontal coupling plane|vertical coupling plane|discharge tip|discharge return cable|polarity sequence|repetition interval',
    '靜電放電|接觸放電|空氣放電|間接放電|水平耦合板|垂直耦合板|放電尖端|放電回流線|極性順序|重複間隔'),
  topic('EFT', '電性快速暫態', 'emc',
    'electrical fast transient|burst generator|coupling clamp|burst duration|burst period|pulse repetition frequency|capacitive coupling|injection network|rise time|source impedance',
    '電性快速暫態|脈衝群產生器|耦合夾|脈衝群持續時間|脈衝群週期|脈衝重複頻率|電容耦合|注入網路|上升時間|源阻抗'),
  topic('Surge', '雷擊突波', 'emc',
    'combination wave generator|open-circuit voltage|short-circuit current|coupling decoupling network|line-to-line coupling|line-to-ground coupling|surge impulse|phase angle synchronization|generator verification|residual voltage',
    '組合波產生器|開路電壓|短路電流|耦合去耦網路|線對線耦合|線對地耦合|突波脈衝|相位角同步|產生器確認|殘餘電壓'),
  topic('Safety Basic', '產品安全基礎', 'safety',
    'electric shock hazard|energy hazard|fire enclosure|mechanical hazard|normal condition|single fault condition|safeguard|accessible part|hazard-based safety engineering|risk assessment',
    '觸電危害|能量危害|防火外殼|機械危害|正常狀態|單一故障狀態|防護措施|可觸及部件|危害導向安全工程|風險評估'),
  topic('Hipot', '耐電壓測試', 'safety',
    'dielectric strength test|test voltage|ramp-up time|trip current|insulation breakdown|withstand duration|primary circuit|secondary circuit|reinforced insulation|test probe clearance',
    '電氣強度測試|測試電壓|升壓時間|跳脫電流|絕緣崩潰|耐壓時間|一次側電路|二次側電路|加強絕緣|測試探棒間距'),
  topic('Leakage Current', '漏電流測試', 'safety',
    'touch current|protective conductor current|patient leakage current|measuring device|rated mains voltage|single-phase supply|normal polarity|reverse polarity|earth leakage|accessible conductive part',
    '接觸電流|保護導體電流|病患漏電流|量測裝置|額定電源電壓|單相電源|正常極性|反向極性|接地漏電流|可觸及導電部件'),
  topic('Ground Bond', '接地導通測試', 'safety',
    'protective bonding test|bonding resistance|test current|protective earthing terminal|bonding conductor|voltage drop|four-wire measurement|contact resistance|earthing symbol|bond integrity',
    '保護接地導通測試|接地電阻|測試電流|保護接地端子|接地導體|壓降|四線式量測|接觸電阻|接地符號|接地完整性'),
  topic('Creepage', '沿面距離', 'safety',
    'creepage distance|pollution degree|material group|comparative tracking index|working voltage|printed wiring board|cemented joint|groove width|insulating surface|micro-environment',
    '沿面距離|污染等級|材料群組|相比漏電起痕指數|工作電壓|印刷電路板|膠合接點|溝槽寬度|絕緣表面|微環境'),
  topic('Clearance', '空間距離', 'safety',
    'clearance distance|overvoltage category|transient overvoltage|peak working voltage|altitude correction|homogeneous field|inhomogeneous field|air gap|basic insulation|supplementary insulation',
    '空間距離|過電壓類別|暫態過電壓|峰值工作電壓|海拔修正|均勻電場|非均勻電場|空氣間隙|基本絕緣|附加絕緣'),
  topic('Certification', '產品驗證', 'certification',
    'conformity assessment|certification body|test laboratory|type approval|technical construction file|declaration of conformity|applicable standard|product family|model difference|certificate holder',
    '符合性評鑑|驗證機構|測試實驗室|型式認可|技術建構文件|符合性聲明|適用標準|產品系列|型號差異|證書持有人'),
  topic('FCC', 'FCC 美國驗證', 'certification',
    'equipment authorization|FCC identifier|grantee code|certification procedure|supplier declaration|intentional radiator|unintentional radiator|modular approval|permissive change|exposure evaluation',
    '設備授權|FCC 識別碼|申請者代碼|驗證程序|供應商聲明|有意輻射器|非有意輻射器|模組認可|允許變更|曝露評估'),
  topic('CE', 'CE 歐盟符合性', 'certification',
    'CE marking|European Union declaration|harmonised standard|notified body|radio equipment directive|electromagnetic compatibility directive|low voltage directive|essential requirement|technical documentation|market surveillance',
    'CE 標誌|歐盟符合性聲明|協調標準|公告機構|無線電設備指令|電磁相容指令|低電壓指令|基本要求|技術文件|市場監督'),
  topic('NCC', 'NCC 台灣驗證', 'certification',
    'NCC type approval|controlled telecommunications device|approval label|local representative|test report submission|radio frequency device|technical specification|approval certificate|import authorization|compliance label',
    'NCC 型式認證|管制電信射頻器材|審驗標籤|本地代理人|測試報告送審|射頻器材|技術規範|審驗證明|輸入許可|符合性標籤'),
  topic('BSMI', 'BSMI 台灣商品檢驗', 'certification',
    'commodity inspection|registration of product certification|declaration of conformity scheme|inspection mark|commodity classification code|local supplier|batch inspection|type test report|certificate renewal|market inspection',
    '商品檢驗|商品驗證登錄|符合性聲明模式|檢驗標識|商品分類號列|本地供應商|逐批檢驗|型式試驗報告|證書展延|市場檢查'),
  topic('UL', 'UL 安全驗證', 'certification',
    'UL listing|recognized component|follow-up service|construction review|critical component|condition of acceptability|variation notice|factory inspection|listing mark|certification requirement decision',
    'UL 列名|認可零組件|後續追蹤服務|結構審查|關鍵零組件|接受條件|差異通知|工廠檢查|列名標誌|驗證要求決定'),
  topic('IEC', 'IEC 國際標準', 'certification',
    'International Electrotechnical Commission|international standard|normative reference|scope clause|test requirement|compliance statement|technical committee|committee draft|edition transition|interpretation sheet',
    '國際電工委員會|國際標準|規範性引用文件|適用範圍條款|測試要求|符合性陳述|技術委員會|委員會草案|版本轉換|解釋文件'),
  topic('EN', 'EN 歐洲標準', 'certification',
    'European standard|national adoption|withdrawal date|presumption of conformity|common modification|European committee|dated reference|undated reference|annex ZA|standard amendment',
    '歐洲標準|國家採用|撤銷日期|推定符合|共同修改|歐洲標準委員會|註明日期引用|未註明日期引用|附錄 ZA|標準修訂'),
  topic('ISO/IEC 17025', 'ISO/IEC 17025 實驗室管理', 'certification',
    'laboratory competence|impartiality risk|metrological traceability|decision rule|method validation|proficiency testing|measurement result|equipment intermediate check|nonconforming work|management review',
    '實驗室能力|公正性風險|計量追溯性|判定規則|方法確效|能力試驗|量測結果|設備期間查核|不符合工作|管理審查'),
  topic('Test Report', '測試報告英文', 'test_report',
    'report identifier|test item description|measurement condition|test setup photograph|result summary|limit line|deviation statement|authorized signatory|revision history|page numbering',
    '報告識別碼|受測品描述|量測條件|測試配置照片|結果摘要|限值線|偏離聲明|授權簽署人|修訂紀錄|頁碼編排'),
  topic('Customer Meeting', '客戶會議英文', 'customer_communication',
    'project kickoff|scope confirmation|schedule alignment|technical clarification|failure notification|root cause update|corrective action plan|sample readiness|delivery milestone|meeting minutes',
    '專案啟動|範圍確認|時程對齊|技術澄清|失敗通知|根因更新|矯正措施計畫|樣品就緒狀態|交付里程碑|會議紀錄'),
  topic('Lab Communication', '實驗室溝通英文', 'lab_equipment',
    'sample check-in|equipment reservation|setup handover|shift log|calibration status|environmental condition|test interruption|witness testing|sample disposition|laboratory housekeeping',
    '樣品收件|設備預約|設定交接|輪班紀錄|校正狀態|環境條件|測試中斷|見證測試|樣品處置|實驗室整理'),
  topic('Job Interview', '工程師英文面試', 'interview',
    'technical achievement|troubleshooting approach|cross-functional teamwork|customer-facing experience|project ownership|learning agility|conflict resolution|quality mindset|career motivation|professional strength',
    '技術成就|除錯方法|跨部門合作|客戶應對經驗|專案當責|學習敏捷度|衝突解決|品質思維|職涯動機|專業優勢')
];

const STAGES = [
  { en: 'fundamentals', zh: '基礎理解', difficulty: 'A2' },
  { en: 'measurement method', zh: '量測方法', difficulty: 'B1' },
  { en: 'setup verification', zh: '設定確認', difficulty: 'B1' },
  { en: 'failure analysis', zh: '失效分析', difficulty: 'B2' },
  { en: 'reporting practice', zh: '報告實務', difficulty: 'B2' },
  { en: 'customer explanation', zh: '客戶說明', difficulty: 'C1' }
];

const DEBUG_CASES = [
  ['Radiated emission fail', '輻射發射超標', ['An unintended cable current is acting as an antenna.', 'The enclosure seam has insufficient shielding.'], ['Rotate the turntable and change antenna height to locate the maximum.', 'Use a current probe to identify the dominant cable path.'], ['Add common-mode suppression at the cable interface.', 'Improve seam bonding and repeat the final measurement.']],
  ['Conducted emission fail', '傳導發射超標', ['The switching supply has inadequate input filtering.', 'A common-mode return path couples noise to the mains.'], ['Compare line and neutral spectra with both detector modes.', 'Probe the input filter and switching node.'], ['Optimize the common-mode choke and X/Y capacitors.', 'Shorten the high-current switching loop.']],
  ['ESD fail', '靜電放電測試失敗', ['The discharge current reaches a sensitive reset line.', 'Chassis bonding impedance is too high.'], ['Reproduce the failing point and polarity.', 'Monitor reset, power, and clock lines during discharge.'], ['Add a low-inductance chassis path.', 'Improve transient protection and firmware recovery.']],
  ['EFT fail', '快速暫態脈衝群測試失敗', ['Burst energy couples through the power input.', 'I/O filtering is located too far from the connector.'], ['Confirm clamp position and coupling length.', 'Monitor supply rails and communication errors.'], ['Move filtering to the entry point.', 'Improve decoupling and cable shielding termination.']],
  ['Surge fail', '雷擊突波測試失敗', ['The protection device clamping voltage is too high.', 'The surge return path has excessive inductance.'], ['Verify coupling mode, polarity, and phase angle.', 'Measure residual voltage at the protected circuit.'], ['Select a coordinated surge protection network.', 'Reduce loop area in the surge current path.']],
  ['Safety hipot fail', '耐電壓測試失敗', ['Insulation spacing is insufficient.', 'Moisture or flux residue lowers insulation resistance.'], ['Inspect the failure location before retesting.', 'Separate components and wiring to isolate the path.'], ['Correct spacing and insulation construction.', 'Control cleaning and humidity before the test.']],
  ['Leakage current fail', '漏電流測試失敗', ['Y-capacitance is excessive for the product class.', 'A wiring error bypasses the intended insulation.'], ['Verify the measuring network and supply polarity.', 'Measure each filter branch separately.'], ['Rebalance filter capacitance within EMC and safety limits.', 'Correct wiring and repeat all required conditions.']],
  ['Ground bond fail', '接地導通測試失敗', ['A painted surface increases contact resistance.', 'The protective bonding conductor is undersized.'], ['Use a four-wire check across each bond.', 'Inspect fastener torque and surface preparation.'], ['Remove insulating coating at the bond point.', 'Use a compliant conductor and locking hardware.']],
  ['Certification document missing', '驗證文件缺漏', ['The submitted model list does not match the report.', 'A critical component certificate has expired.'], ['Compare the submission checklist with the technical file.', 'Verify certificate scope, model, and validity.'], ['Update controlled documents and obtain approval.', 'Record the corrected revision in the submission index.']],
  ['Antenna gain mismatch', '天線增益不一致', ['The production antenna differs from the approved sample.', 'Cable loss was omitted from the gain calculation.'], ['Confirm antenna part number and revision.', 'Recalculate gain using calibrated path loss.'], ['Restore the approved antenna configuration.', 'Update the technical file when an authorized change applies.']],
  ['Wrong test setup', '測試設定錯誤', ['The measurement distance is incorrect.', 'The required auxiliary mode was not activated.'], ['Pause the test and compare setup against the method.', 'Photograph connections and verify instrument settings.'], ['Rebuild the setup from the approved checklist.', 'Invalidate affected results and repeat the sequence.']],
  ['Incorrect sample configuration', '樣品配置錯誤', ['The wrong firmware or regional mode is installed.', 'The sample is not transmitting at the required worst case.'], ['Record hardware, firmware, and regulatory domain.', 'Verify mode, channel, bandwidth, and power setting.'], ['Load the controlled configuration.', 'Add configuration evidence to the test record.']]
];

const INTERVIEWS = [
  ['Self Introduction', 'Please introduce yourself as an RF compliance engineer.', '請用專業經歷、核心能力與成果組成 60 秒自我介紹。', 'I am an RF compliance engineer with hands-on experience in measurement, debugging, and certification. I communicate test evidence clearly and work across design, laboratory, and customer teams.'],
  ['RF Test Experience', 'Describe your RF test experience.', '請說明儀器、標準、測試流程與一項可量化成果。', 'I plan test configurations, verify instruments, capture traceable results, and investigate abnormal RF behavior. I also explain the technical impact to project teams.'],
  ['EMC Debug Experience', 'Tell me about an EMC issue you debugged.', '使用情境、行動、結果架構，說明如何找到耦合路徑。', 'I reproduced the failure, isolated the dominant coupling path, and compared controlled design changes. The final fix improved margin without affecting product performance.'],
  ['Safety Test Experience', 'How do you prepare for a product safety test?', '從關鍵零組件、絕緣、接地與異常條件回答。', 'I review the construction, critical components, insulation system, and fault conditions before testing. I document every configuration so the evidence remains traceable.'],
  ['Certification Process', 'Explain a certification process you managed.', '涵蓋適用法規、送樣、報告、文件與證書追蹤。', 'I confirm market requirements, coordinate testing, review the technical file, and track findings through closure. I keep model and document revisions aligned throughout submission.'],
  ['Customer Communication', 'How do you explain a failed test to a customer?', '先講事實與影響，再講調查計畫和下一個決策點。', 'I state the measured result and limit first, then separate confirmed facts from working hypotheses. I provide an investigation plan, owners, and the next update time.'],
  ['Weakness and Strength', 'What are your professional strength and weakness?', '優點要有證據；弱點要說明改善方法與進展。', 'My strength is structured troubleshooting supported by evidence. I used to spend too long refining reports, so I now align the decision question first and time-box each review.'],
  ['Why should we hire you?', 'Why should we hire you for this engineering role?', '連結職務需求、你的證據與能創造的價值。', 'I combine laboratory discipline, practical debugging, and clear English communication. That helps teams reach compliant designs faster and make decisions from reliable evidence.'],
  ['Explain a failed test case', 'Explain a failed test case and its outcome.', '清楚交代標準、失敗數據、根因、修正及複測結果。', 'The initial result exceeded the limit. I verified the setup, isolated the path, and tested one change at a time. The confirmed correction passed the repeated measurement with stable margin.'],
  ['Explain how you solved a problem', 'How did you solve a difficult engineering problem?', '以可重現問題、假設、實驗、證據與決策回答。', 'I converted the issue into testable hypotheses, controlled the variables, and recorded each result. The evidence identified the root cause and supported a low-risk corrective action.']
];

const SENTENCE_TEMPLATES = [
  ['Please verify {a} before we start the test.', '開始測試前，請確認{A}。'],
  ['The measured {a} remains within the specified limit.', '量測到的{A}仍在規定限值內。'],
  ['We need traceable evidence for {a}.', '我們需要可追溯的{A}證據。'],
  ['Could you record {a} in the test log?', '可以請你把{A}記錄在測試日誌嗎？'],
  ['Let us compare {a} with the approved configuration.', '讓我們把{A}與核准配置進行比對。'],
  ['The latest result indicates a change in {a}.', '最新結果顯示{A}有所變化。'],
  ['I will explain how {a} affects compliance.', '我會說明{A}如何影響符合性。'],
  ['Please keep {a} unchanged during the comparison.', '進行比較時，請保持{A}不變。'],
  ['Our review found no abnormality in {a}.', '我們的審查未發現{A}有異常。'],
  ['The team will repeat {a} under the worst-case condition.', '團隊會在最嚴苛條件下重新執行{A}。'],
  ['Can you confirm the acceptance criterion for {a}?', '你可以確認{A}的接受準則嗎？'],
  ['The report clearly identifies the method used for {a}.', '報告已清楚標示{A}所使用的方法。'],
  ['We isolated {a} as the dominant factor.', '我們已確認{A}是主要影響因素。'],
  ['Please include the uncertainty related to {a}.', '請納入與{A}相關的不確定度。'],
  ['The customer requested a concise update on {a}.', '客戶要求提供{A}的精簡進度說明。']
];

const EXAMPLE_TEMPLATES = [
  ['The team reviewed {e} before approving the Day {d} test configuration.', '團隊在核准第 {d} 天的測試配置前審查了{z}。'],
  ['The test plan identifies how {e} will be controlled and recorded.', '測試計畫說明如何控制並記錄{z}。'],
  ['The laboratory evaluates {e} under documented environmental conditions.', '實驗室在有紀錄的環境條件下評估{z}。'],
  ['The engineer explained why {e} was relevant to the compliance decision.', '工程師說明了{z}與符合性判定的關聯。'],
  ['The technical record includes objective evidence for {e}.', '技術紀錄包含{z}的客觀證據。'],
  ['The reviewer checked {e} against the controlled procedure.', '審查人員依受控程序確認{z}。'],
  ['The project team discussed {e} during the pre-test meeting.', '專案團隊在測試前會議中討論了{z}。'],
  ['The report links {e} to the applicable requirement and result.', '報告將{z}連結到適用要求與結果。'],
  ['The technician verified {e} before connecting the sample.', '技術員在連接樣品前確認了{z}。'],
  ['The customer requested a clear explanation of {e}.', '客戶要求清楚說明{z}。'],
  ['The test log records the condition associated with {e}.', '測試日誌記錄了與{z}相關的條件。'],
  ['The assessor reviewed the traceable evidence supporting {e}.', '評鑑人員審查了支持{z}的可追溯證據。'],
  ['The engineer compared {e} with the approved baseline.', '工程師將{z}與核准基準進行比較。'],
  ['The team evaluated the technical risk related to {e}.', '團隊評估了與{z}相關的技術風險。'],
  ['The procedure defines the acceptance criterion for {e}.', '程序定義了{z}的接受準則。'],
  ['We confirmed {e} before releasing the measurement result.', '我們在發布量測結果前確認了{z}。'],
  ['The investigation separated observations about {e} from working hypotheses.', '調查將{z}的觀察結果與待驗證假設分開記錄。'],
  ['The final review found that {e} was consistently documented.', '最終審查確認{z}已有一致的文件紀錄。']
];

function padDay(day) { return String(day).padStart(3, '0'); }
function pronunciation(text) {
  const spoken = text
    .replace(/RF/g, 'R-F').replace(/EMC/g, 'E-M-C').replace(/FCC/g, 'F-C-C')
    .replace(/NCC/g, 'N-C-C').replace(/BSMI/g, 'B-S-M-I').replace(/IEC/g, 'I-E-C')
    .replace(/ISO/g, 'eye-so').replace(/Wi-Fi/g, 'why-fye').replace(/OTA/g, 'O-T-A')
    .replace(/ESD/g, 'E-S-D').replace(/EFT/g, 'E-F-T').replace(/UL/g, 'U-L');
  return `en-US · ${spoken}`;
}
function apply(template, term) {
  return template.replaceAll('{a}', term.english).replaceAll('{A}', term.zh_tw);
}
function contextualTerm(base, category, cycle) {
  if (cycle === 0) return { english: base.english, zh_tw: base.zh_tw };
  if (cycle === 1) {
    const context = {
      rf: ['measurement', '量測'], emc: ['measurement', '量測'], safety: ['evaluation', '評估'],
      certification: ['review', '審查'], interview: ['practice', '練習'], lab_equipment: ['procedure', '程序'],
      test_report: ['review', '審查'], customer_communication: ['discussion', '討論']
    }[category];
    return { english: `${base.english} ${context[0]}`, zh_tw: `${base.zh_tw}${context[1]}` };
  }
  const contexts = [null, null, ['verification', '確認'], ['issue analysis', '問題分析'], ['documentation', '文件化'], ['explanation', '說明']];
  return { english: `${base.english} ${contexts[cycle][0]}`, zh_tw: `${base.zh_tw}${contexts[cycle][1]}` };
}
function choicePool(items, answerIndex, field) {
  const picks = [items[answerIndex], items[(answerIndex + 3) % 10], items[(answerIndex + 6) % 10], items[(answerIndex + 8) % 10]];
  return picks.map(item => item[field]);
}
function createDebug(day, topicInfo) {
  const source = DEBUG_CASES[(day - 1) % DEBUG_CASES.length];
  return {
    title: `${source[0]} — ${topicInfo.name} investigation`,
    title_zh_tw: `${source[1]}：${topicInfo.zh}調查`,
    problem: `A pre-compliance check on Day ${padDay(day)} shows a repeatable ${source[0].toLowerCase()} condition.`,
    background: `The ${topicInfo.name} configuration was documented before the result was compared with the applicable criterion. This is a realistic training scenario; learners must distinguish observations from hypotheses.`,
    possible_causes: source[2], check_steps: source[3], corrective_actions: source[4],
    supervisor_question: `How would you prove the root cause before changing the ${topicInfo.name} design?`,
    suggested_answer: `I would first verify the setup and reproduce the result. Then I would isolate one variable at a time, record objective evidence, and repeat the measurement after the corrective action.`
  };
}
function createInterview(day, topicInfo) {
  const source = INTERVIEWS[(day - 1) % INTERVIEWS.length];
  return {
    category: source[0],
    question: `${source[1]} Connect your answer to ${topicInfo.name}.`,
    hint_zh_tw: `${source[2]} 並連結到「${topicInfo.zh}」。`,
    sample_answer: `${source[3]} In ${topicInfo.name}, I make sure that conclusions are supported by controlled measurements.`,
    natural_rewrite: `A natural engineering answer uses a clear context, your specific action, objective evidence, and the resulting technical or business impact.`
  };
}
function createQuiz(words, interview) {
  const blankSentence = words[2].example.replace(new RegExp(words[2].english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '________');
  return [
    { id: 'en-zh', type: 'english_to_chinese', prompt: `「${words[0].english}」的正確繁體中文是什麼？`, options: choicePool(words, 0, 'zh_tw'), answer: words[0].zh_tw, explanation: `${words[0].english} 指的是「${words[0].zh_tw}」。`, term: words[0].english },
    { id: 'zh-en', type: 'chinese_to_english', prompt: `「${words[1].zh_tw}」的正確工程英文是什麼？`, options: choicePool(words, 1, 'english'), answer: words[1].english, explanation: `工程文件中可使用 ${words[1].english}。`, term: words[1].english },
    { id: 'blank', type: 'fill_in_the_blank', prompt: blankSentence, prompt_zh_tw: words[2].example_zh_tw, answer: words[2].english, accepted_answers: [words[2].english.toLowerCase()], explanation: `完整句子的關鍵詞是 ${words[2].english}。`, term: words[2].english },
    { id: 'listen', type: 'listening', prompt: '播放語音後，選出你聽到的專業詞彙。', speech: words[3].english, options: choicePool(words, 3, 'english'), answer: words[3].english, explanation: `播放內容是 ${words[3].english}（${words[3].zh_tw}）。`, term: words[3].english },
    { id: 'interview', type: 'interview_short_answer', prompt: interview.question, prompt_zh_tw: interview.hint_zh_tw, answer: interview.sample_answer, keywords: [words[4].english.split(' ')[0], 'evidence', 'result'], explanation: '回答應包含具體行動、工程證據與結果；系統採關鍵概念給分。', term: words[4].english }
  ];
}
function generateLesson(day) {
  const topicIndex = (day - 1) % TOPICS.length;
  const cycle = Math.floor((day - 1) / TOPICS.length);
  const topicInfo = TOPICS[topicIndex];
  const stage = STAGES[cycle];
  const words = topicInfo.terms.map((base, index) => {
    const term = contextualTerm(base, topicInfo.category, cycle);
    const variant = (day * 7 + index * 5) % EXAMPLE_TEMPLATES.length;
    const example = EXAMPLE_TEMPLATES[variant][0].replaceAll('{e}', term.english).replaceAll('{d}', padDay(day));
    const example_zh_tw = EXAMPLE_TEMPLATES[variant][1].replaceAll('{z}', term.zh_tw).replaceAll('{d}', padDay(day));
    return { english: term.english, zh_tw: term.zh_tw, pronunciation: pronunciation(term.english), category: topicInfo.category, difficulty: stage.difficulty, example, example_zh_tw };
  });
  const common_sentences = Array.from({ length: 5 }, (_, index) => {
    const template = SENTENCE_TEMPLATES[(day * 3 + index * 2) % SENTENCE_TEMPLATES.length];
    return { english: apply(template[0], words[(index + day) % 10]), zh_tw: apply(template[1], words[(index + day) % 10]) };
  });
  const dialogue = {
    context: `${topicInfo.name} pre-test review`, context_zh_tw: `${topicInfo.zh}測試前審查`,
    lines: [
      { speaker: 'Engineer', english: `I have verified ${words[0].english} and recorded the setup.`, zh_tw: `我已確認${words[0].zh_tw}並記錄測試設定。` },
      { speaker: 'Reviewer', english: `Good. What evidence supports the decision for ${words[1].english}?`, zh_tw: `很好。有哪些證據支持對${words[1].zh_tw}的判定？` },
      { speaker: 'Engineer', english: `The calibrated result, uncertainty record, and setup photographs are linked in the test log.`, zh_tw: '校正後的結果、不確定度紀錄與測試設定照片都已連結於測試日誌。' },
      { speaker: 'Reviewer', english: 'Please confirm the acceptance criterion before releasing the report.', zh_tw: '發布報告前，請確認接受準則。' }
    ]
  };
  const interview = createInterview(day, topicInfo);
  return {
    schema_version: '1.0', day, id: `day${padDay(day)}`,
    topic: topicInfo.name, topic_zh_tw: topicInfo.zh,
    stage: stage.en, stage_zh_tw: stage.zh,
    duration_minutes: 15,
    objectives: [`Use ten ${topicInfo.name} terms accurately.`, 'Explain one evidence-based engineering decision.', 'Complete a five-question mixed-format quiz.'],
    vocabulary: words, common_sentences, dialogue,
    debug_case: createDebug(day, topicInfo), interview_question: interview,
    quiz: createQuiz(words, interview)
  };
}

function main() {
  fs.mkdirSync(LESSON_DIR, { recursive: true });
  fs.mkdirSync(VOCAB_DIR, { recursive: true });
  const vocabulary = Object.fromEntries(['rf', 'emc', 'safety', 'certification', 'interview', 'lab_equipment', 'test_report', 'customer_communication'].map(key => [key, []]));
  const index = [];
  for (let day = 1; day <= 65; day += 1) {
    const lesson = generateLesson(day);
    fs.writeFileSync(path.join(LESSON_DIR, `${lesson.id}.json`), `${JSON.stringify(lesson, null, 2)}\n`, 'utf8');
    vocabulary[lesson.vocabulary[0].category].push(...lesson.vocabulary);
    index.push({ day, id: lesson.id, topic: lesson.topic, topic_zh_tw: lesson.topic_zh_tw, stage: lesson.stage, stage_zh_tw: lesson.stage_zh_tw, duration_minutes: lesson.duration_minutes });
  }
  fs.writeFileSync(path.join(LESSON_DIR, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  for (const [category, entries] of Object.entries(vocabulary)) {
    fs.writeFileSync(path.join(VOCAB_DIR, `${category}.json`), `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
  }
  const debugCatalog = DEBUG_CASES.map((item, index) => ({
    id: `debug-${String(index + 1).padStart(2, '0')}`,
    title: item[0], title_zh_tw: item[1],
    problem: `A repeatable ${item[0].toLowerCase()} result is found during a controlled compliance evaluation.`,
    background: 'The setup and sample configuration are recorded. The engineer must verify the observation, isolate the coupling or failure path, and preserve traceable evidence.',
    possible_causes: item[2], check_steps: item[3], corrective_actions: item[4],
    supervisor_question: 'How would you confirm the root cause and demonstrate that the correction is effective?',
    suggested_answer: 'I would verify the setup, reproduce the result, and change one controlled variable at a time. After identifying the root cause, I would repeat the required test and document objective evidence.'
  }));
  const interviewCatalog = INTERVIEWS.map((item, index) => ({
    id: `interview-${String(index + 1).padStart(2, '0')}`,
    category: item[0], question: item[1], hint_zh_tw: item[2],
    sample_answer: item[3],
    natural_rewrite: 'Use a concise context, a specific action, objective evidence, and the resulting technical or business impact.'
  }));
  fs.writeFileSync(path.join(ROOT, 'data', 'debug-cases.json'), `${JSON.stringify(debugCatalog, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'data', 'interviews.json'), `${JSON.stringify(interviewCatalog, null, 2)}\n`, 'utf8');
  console.log(`Generated ${index.length} lessons and ${Object.values(vocabulary).reduce((sum, list) => sum + list.length, 0)} vocabulary records.`);
}

if (require.main === module) main();
module.exports = { main, generateLesson, TOPICS, DEBUG_CASES, INTERVIEWS };
