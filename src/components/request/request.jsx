import React, { useState } from "react";
import styles from "./request.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backb from "../../img/back-arrow.png";
import imgPut from "../../img/imgput.png";
import search from "../../img/search.png";
import CategoryBottomSheet from "./CategoryBottomSheet";

const Request = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [address, setAddress] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [category, setCategory] = useState("");
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false); 
  const [title, setTitle] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [expectedTime, setExpectedTime] = useState("");
  const [fee, setFee] = useState("");
  const [cctvOption, setCctvOption] = useState(""); // CCTV 선택 상태
  const [petOption, setPetOption] = useState(""); // 반려동물 옵션 상태
  const [parkingOption, setParkingOption] = useState(""); // 주차 가능 옵션 상태
  const [partnerPreference, setPartnerPreference] = useState(""); // 파트너 선호 옵션 상태
  const [isFeeNegotiable, setIsFeeNegotiable] = useState(false); // 금액 제안 허용 여부

  const navigate = useNavigate();
  const goBack = () => navigate("/main");

  // 카테고리 선택 핸들러
  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setIsCategorySheetOpen(false); // 바텀시트 닫기
  };

  // 이미지 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // 이미지 미리보기
    }
  };

  // 카카오 주소 검색 API 호출
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let fullAddress = data.address; // 기본 주소
        let extraAddress = ""; // 참고 항목

        if (data.addressType === "R") {
          if (data.bname !== "") extraAddress += data.bname;
          if (data.buildingName !== "")
            extraAddress +=
              extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
          fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        setAddress(fullAddress); // 주소 상태에 저장
      },
    }).open();
  };

  // 금액 제안 허용 체크박스 핸들러
  const handleFeeNegotiableChange = (e) => {
    setIsFeeNegotiable(e.target.checked);
  };

  // 데이터 제출 함수
  const handleSubmit = async () => {
    const userData = {
      category, // 카테고리
      title, // 제목
      taskDetails: {
        description: requestDetails, // 요청사항
        photoUrl: selectedImage || "", // 이미지 URL
      },
      location: {
        area: address, // 기본 주소
        detailedAddress, // 상세 주소
        extraNotes: "", // 기타 전달사항
      },
      conditions: {
        hasCCTV: cctvOption === "있어요", // CCTV 여부
        hasAnimals: petOption === "있어요", // 반려동물 여부
        partnerParkingAvailable: parkingOption === "가능해요", // 주차 가능 여부
      },
      partnerPreference: {
        gender: partnerPreference, // 파트너 성별
        ageRange: "", // 선호 연령대 (추가 필요 시 값 지정)
        otherPreferences: "", // 기타 선호 조건
      },
      schedule: {
        date, // 예약 날짜
        time: startTime, // 시작 시간
        estimatedDuration: expectedTime, // 예상 소요 시간
      },
      payment: {
        serviceFee: fee, // 심부름비
        minFee: 5000, // 최소 금액
      },
      isFeeNegotiable: false, // 금액 제안 허용 여부
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/order/create",
        userData
      );
      alert("심부름 의뢰가 완료되었습니다!");
      console.log(response.data);
    } catch (error) {
      console.error("심부름 의뢰 실패:", error);
      alert("심부름 의뢰에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCctvClick = (option) => setCctvOption(option);
  const handlePetClick = (option) => setPetOption(option);
  const handleParkingClick = (option) => setParkingOption(option);
  const handlePartnerClick = (option) => setPartnerPreference(option);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img onClick={goBack} src={backb} className={styles.backb} alt="뒤로가기 버튼" />
        <h1 className={styles.title}>심부름 의뢰하기</h1>
      </div>

      {/* 카테고리 */}
      <div className={styles.section}>
        <label>카테고리</label>
        <button
          className={styles.categoryButton}
          onClick={() => setIsCategorySheetOpen(true)} // 바텀시트 열기
        >
          {category || "의뢰할 심부름의 카테고리를 선택해주세요"}
        </button>
      </div>

      {/* 바텀시트 모달 */}
      {isCategorySheetOpen && (
        <CategoryBottomSheet
          onClose={() => setIsCategorySheetOpen(false)}
          onSelect={handleCategorySelect}
        />
      )}

      {/* 제목 */}
      <div className={styles.section}>
        <label>제목</label>
        <input
          type="text"
          placeholder="요청 심부름에 어울리는 제목을 작성해 주세요"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 요청사항 */}
      <div className={styles.section}>
        <label>무엇을 요청할까요?</label>
        <textarea
          placeholder="수거할 품목, 수거할 양, 기타 요청 사항 등 입력"
          maxLength="500"
          className={styles.textarea}
          value={requestDetails}
          onChange={(e) => setRequestDetails(e.target.value)}
        ></textarea>
      </div>

      {/* 사진 업로드 */}
      <div className={styles.imageUploadContainer}>
        <label className={styles.uploadLabel}>
          <input
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleImageChange}
          />
          <div className={styles.uploadBox}>
            <img
              src={selectedImage || imgPut}
              alt="이미지 미리보기"
              className={styles.previewImage}
            />
          </div>
          <span className={styles.uploadText}>사진을 등록해 보세요</span>
        </label>
      </div>

      {/* 주소 입력 */}
      <div className={styles.section}>
        <label>어디에서 진행할까요?</label>
        <div className={styles.addressContainer}>
          <input
            type="text"
            placeholder="주소 검색"
            className={styles.input}
            value={address}
            readOnly
          />
          <img
            src={search}
            alt="검색 아이콘"
            className={styles.searchIcon}
            onClick={handleAddressSearch}
          />
        </div>
        <input
          type="text"
          placeholder="상세 주소"
          className={styles.input}
          value={detailedAddress}
          onChange={(e) => detailedAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="전달 사항 입력"
          className={styles.input}
        />
      </div>
      

      {/* 추가 옵션 */}
      <div className={styles.optionSection}>
        <label className={styles.optionLabel}>진행 장소에 CCTV가 있나요?</label>
        <p className={styles.subText}>
          「<span className={styles.highlight}>개인정보보호법</span>」에 따라 파트너에게 안내가 필요해요
        </p>
        <div className={styles.options}>
          <button
            className={`${styles.optionButton} ${
              cctvOption === "있어요" ? styles.active : ""
            }`}
            onClick={() => handleCctvClick("있어요")}
          >
            있어요
          </button>
          <button
            className={`${styles.optionButton} ${cctvOption === "없어요" ? styles.active : ""}`}
            onClick={() => handleCctvClick("없어요")}
          >
            없어요
          </button>
        </div>
      </div>

      {/* 반려동물 */}
      <div className={styles.optionSection}>
        <label>진행 장소에 반려동물이 있나요?</label>
        <div className={styles.options}>
          <button
            className={`${styles.optionButton} ${petOption === "있어요" ? styles.active : ""}`}
            onClick={() => handlePetClick("있어요")}
          >
            있어요
          </button>
          <button
            className={`${styles.optionButton} ${petOption === "없어요" ? styles.active : ""}`}
            onClick={() => handlePetClick("없어요")}
          >
            없어요
          </button>
        </div>
      </div>

      {/* 주차 */}
      <div className={styles.optionSection}>
        <label>파트너 주차가 가능한가요?</label>
        <div className={styles.options}>
          <button
            className={`${styles.optionButton} ${parkingOption === "가능해요" ? styles.active : ""}`}
            onClick={() => handleParkingClick("가능해요")}
          >
            가능해요
          </button>
          <button
            className={`${styles.optionButton} ${parkingOption === "불가능해요" ? styles.active : ""}`}
            onClick={() => handleParkingClick("불가능해요")}
          >
            불가능해요
          </button>
        </div>
      </div>

      {/* 파트너 선호 */}
      <div className={styles.optionSection}>
        <label>어떤 파트너를 선호하시나요?</label>
        <div className={styles.options}>
          <button
            className={`${styles.optionButton} ${partnerPreference === "무관" ? styles.active : ""}`}
            onClick={() => handlePartnerClick("무관")}
          >
            무관
          </button>
          <button
            className={`${styles.optionButton} ${partnerPreference === "남성" ? styles.active : ""}`}
            onClick={() => handlePartnerClick("남성")}
          >
            남성
          </button>
          <button
            className={`${styles.optionButton} ${partnerPreference === "여성" ? styles.active : ""}`}
            onClick={() => handlePartnerClick("여성")}
          >
            여성
          </button>
        </div>
      </div>

      {/* 예약 날짜 및 시간 */}
      <div className={styles.section}>
        <label>언제로 예약할까요?</label>
        <input type="date" className={styles.input} value={date} onChange={(e) => setDate(e.target.value)}/>
      </div>
      <div className={styles.section}>
        <label>심부름 시작 시간을 선택해 주세요</label>
        <input type="time" className={styles.input} value={startTime} onChange={(e) => setStartTime(e.target.value)}/>
      </div>
      <div className={styles.section}>
        <label>심부름 예상 소요시간을 알려주세요</label>
        <input type="time" className={styles.input} value={expectedTime} onChange={(e) => setExpectedTime(e.target.value)}/>
      </div>

      {/* 심부름비 입력 */}
      <div className={styles.section}>
        <label>심부름비를 입력해 주세요</label>
        <div className={styles.feeInputContainer}>
          <input
            type="number"
            placeholder="0"
            className={styles.input}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
          <span className={styles.feeUnit}>원</span>
        </div>
        {/* 금액 제안 허용 체크박스 */}
        <div className={styles.feeNegotiableContainer}>
          <input
            type="checkbox"
            id="feeNegotiable"
            className={styles.checkbox}
            checked={isFeeNegotiable}
            onChange={handleFeeNegotiableChange}
          />
          <label htmlFor="feeNegotiable" className={styles.checkboxLabel}>
            금액 제안 허용
          </label>
        </div>
      </div>

      {/* 완료 버튼 */}
      <button onClick={handleSubmit} className={styles.completeButton} >
        완료
      </button>
    </div>
  );
};

export default Request;
