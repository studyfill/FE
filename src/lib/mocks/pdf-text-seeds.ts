import { normalizePdfPages } from "@/lib/pdf/normalize-pdf-pages"
import type { UserFile } from "@/types/user-file"
import type { UserFilePdfPage, UserFilePdfText } from "@/types/pdf-text"

const isTreeUserFile = (name: string) => /트리|tree|bst|이진/i.test(name)
const isOsUserFile = (name: string) => /운영체제|os|프로세스|스케줄/i.test(name)

const treePages: UserFilePdfPage[] = [
  {
    pageNumber: 12,
    text:
      "트리는 노드와 간선으로 이루어진 비선형 자료구조이다. N개의 노드로 이루어진 트리는 항상 N-1개의 간선을 갖는다. 루트 노드는 부모가 없는 최상위 노드이며, 리프 노드는 자식이 없는 노드이다. 깊이는 루트에서 해당 노드까지의 거리이고, 루트의 깊이는 0이다.",
  },
  {
    pageNumber: 13,
    text:
      "이진 탐색 트리(BST)는 각 노드의 왼쪽 서브트리 키가 현재 키보다 작고, 오른쪽 서브트리 키가 현재 키보다 크도록 정렬 규칙을 만족한다. 균형이 유지되면 탐색·삽입·삭제의 평균 시간복잡도는 O(log n)이다. 정렬된 입력을 순서대로 삽입하면 편향 트리가 되어 최악 O(n)까지 degrades 될 수 있다.",
  },
  {
    pageNumber: 14,
    text:
      "inorder 순회는 왼쪽 자식, 현재 노드, 오른쪽 자식 순으로 방문하며 BST에서는 키를 오름차순으로 출력한다. 높이는 노드에서 가장 먼 리프까지의 거리이며, 리프의 높이는 0이다. 이진 트리는 자식이 최대 2개라는 구조적 정의만 갖고, BST처럼 정렬 규칙을 포함하지는 않는다.",
  },
  {
    pageNumber: 15,
    text:
      "균형 BST의 높이는 대략 ⌊log₂ N⌋에 가깝다. 파일 시스템의 디렉터리 구조는 트리로 모델링할 수 있다. 우선순위 큐는 힙이라는 완전 이진 트리로 구현하기도 한다. 시험에서는 간선 수 공식, BST 평균·최악 복잡도, 편향 트리가 생기는 입력 조건을 자주 묻는다.",
  },
]

const osPages: UserFilePdfPage[] = [
  {
    pageNumber: 3,
    text:
      "프로세스는 실행 중인 프로그램이다. 운영체제는 CPU, 메모리, I/O 장치 같은 자원을 프로세스에 할당하고 스케줄링한다. PCB(Process Control Block)에는 프로세스 상태, 프로그램 카운터, 레지isters, 메모리 한계 등 문맥 교환에 필요한 정보가 저장된다.",
  },
  {
    pageNumber: 5,
    text:
      "CPU 스케줄링은 준비 큐(ready queue)에 있는 프로세스 중 다음에 실행할 프로세스를 선택하는 것이다. Round Robin은 타임 퀌텀(time quantum)이 지나면 다음 프로세스로 전환하는 선점형 알고리즘이다. SJF는 실행 시간이 짧은 프로세스를 우선 실행한다.",
  },
  {
    pageNumber: 8,
    text:
      "스레드는 같은 프로세스의 주소 공간, 코드, 데이터, 힙을 공유하지만 스택과 레지isters는 독립적이다. 뮤텍스는 상호 배제(mutual exclusion) 락을 제공한다. 세마포어는 P(wait)와 V(signal) 연산으로 공유 자원 접근을 제어한다.",
  },
  {
    pageNumber: 12,
    text:
      "가상 메모리는 논리 주소를 물리 주소로 변환한다. 페이지 테이블은 논리 페이지를 물리 프레임에 매핑한다. TLB(Translation Lookaside Buffer)는 페이지 테이블의 캐시 역할을 한다. DMA(Direct Memory Access)는 CPU 개입 없이 메모리와 I/O 장치 간 데이터를 전송한다.",
  },
]

const genericPages = (userFile: UserFile): UserFilePdfPage[] => [
  {
    pageNumber: 1,
    text: `${userFile.name.replace(/\.pdf$/i, "")} 자료의 서론이다. 학습 범위의 핵심 개념과 정의를 먼저 파악해야 한다. 시험에 자주 나오는 용어와 개념쌍을 표로 정리하면 복습에 도움이 된다.`,
  },
  {
    pageNumber: 2,
    text:
      "원인과 결과 관계는 화살표(→)로 정리하면 기억하기 쉽다. 공식은 적용 조건과 함께 외워야 실수를 줄일 수 있다. 헷갈리는 표현은 한 줄 정의로 구분해 두는 것이 좋다.",
  },
]

export const getSeedPdfText = (userFile: UserFile): UserFilePdfText | null => {
  const rawPages = isTreeUserFile(userFile.name)
    ? treePages
    : isOsUserFile(userFile.name)
      ? osPages
      : genericPages(userFile)

  return {
    userFileId: userFile.id,
    extractedAt: userFile.uploadedAt,
    pages: normalizePdfPages(rawPages, userFile.pageCount),
  }
}
