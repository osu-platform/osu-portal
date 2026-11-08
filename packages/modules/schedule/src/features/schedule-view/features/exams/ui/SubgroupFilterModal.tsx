import { Cell, Modal, Section, Switch, Title } from "@portal/shared-ui"
import type { SubjectWithSubgroups } from "../hooks/useSubgroupFilter"
import { makeFilterKey } from "../hooks/useSubgroupFilter"
import styles from "./SubgroupFilterModal.module.css"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjects: SubjectWithSubgroups[]
  hidden: Set<string>
  onToggle: (subjectCode: string, subgroupNum: string) => void
}

export const SubgroupFilterModal = ({
  open,
  onOpenChange,
  subjects,
  hidden,
  onToggle,
}: Props) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange} header={<Modal.Header />}>
      <div className={styles.content}>
        <Title level="2" weight="2" className={styles.title}>
          Настройка подгрупп
        </Title>

        {subjects.map((subject) => (
          <Section key={subject.subjectCode} header={subject.subjectName}>
            {subject.subgroups.map((sg) => (
              <Cell
                key={sg.num}
                onClick={() => onToggle(subject.subjectCode, sg.num)}
                after={
                  <Switch
                    checked={!hidden.has(makeFilterKey(subject.subjectCode, sg.num))}
                    onChange={() => onToggle(subject.subjectCode, sg.num)}
                  />
                }
              >
                {sg.abbr}
              </Cell>
            ))}
          </Section>
        ))}
      </div>
    </Modal>
  )
}
