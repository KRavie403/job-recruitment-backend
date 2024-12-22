import pandas as pd

# CSV 파일 불러오기
file_path1 = 'saramin.csv'  # 첫 번째 CSV 파일 경로
file_path2 = 'saramin_companies.csv'  # 두 번째 CSV 파일 경로

# CSV 파일 읽기
df1 = pd.read_csv(file_path1)
df2 = pd.read_csv(file_path2)

# 두 CSV 파일 합치기 (세로로 병합 후 중복 제거)
combined_df = pd.concat([df1, df2], ignore_index=True)  # 세로로 합치기
combined_df = combined_df.drop_duplicates()  # 중복된 행 제거

# 비어있는 값 '-'로 채우기
combined_df = combined_df.fillna('-')

# 결과를 새 CSV 파일로 저장
output_path = 'saramin.csv'
combined_df.to_csv(output_path, index=False, encoding='utf-8-sig')

print(f"합쳐진 중복 제거 CSV 파일이 저장되었습니다: {output_path}")
